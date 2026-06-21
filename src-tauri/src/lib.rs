use std::sync::atomic::{AtomicU16, Ordering};
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;
use tokio::net::TcpListener;

static SERVER_PORT: AtomicU16 = AtomicU16::new(0);

// 文件系统命令
#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    tokio::fs::read_to_string(&path)
        .await
        .map_err(|e| format!("Failed to read file '{}': {}", path, e))
}

#[tauri::command]
async fn write_file(path: String, contents: String) -> Result<(), String> {
    tokio::fs::write(&path, contents)
        .await
        .map_err(|e| format!("Failed to write file '{}': {}", path, e))
}

#[tauri::command]
async fn delete_file(path: String) -> Result<(), String> {
    tokio::fs::remove_file(&path)
        .await
        .map_err(|e| format!("Failed to delete file '{}': {}", path, e))
}

#[tauri::command]
async fn list_dir(path: String) -> Result<Vec<String>, String> {
    let mut entries = Vec::new();
    let mut dir = tokio::fs::read_dir(&path)
        .await
        .map_err(|e| format!("Failed to read directory '{}': {}", path, e))?;

    while let Some(entry) = dir
        .next_entry()
        .await
        .map_err(|e| format!("Failed to read directory entry: {}", e))?
    {
        entries.push(entry.path().to_string_lossy().to_string());
    }

    Ok(entries)
}

// 应用路径命令
#[tauri::command]
async fn get_user_data_path(app_handle: AppHandle) -> Result<String, String> {
    app_handle
        .path()
        .app_data_dir()
        .map(|p| p.to_string_lossy().to_string())
        .map_err(|e| format!("Failed to get user data path: {}", e))
}

#[tauri::command]
async fn get_app_path(app_handle: AppHandle) -> Result<String, String> {
    app_handle
        .path()
        .resource_dir()
        .map(|p| p.to_string_lossy().to_string())
        .map_err(|e| format!("Failed to get app path: {}", e))
}

// 服务器端口命令
#[tauri::command]
fn get_server_port() -> Result<u16, String> {
    let port = SERVER_PORT.load(Ordering::Relaxed);
    if port == 0 {
        return Err("Server port not set".to_string());
    }
    Ok(port)
}

#[tauri::command]
fn set_server_port(port: u16) {
    SERVER_PORT.store(port, Ordering::Relaxed);
}

// 端口管理命令
#[tauri::command]
async fn find_available_port(start: u16, end: u16) -> Result<u16, String> {
    if start > end {
        return Err("Invalid port range: start must be less than or equal to end".to_string());
    }

    for port in start..=end {
        if is_port_available(port, "127.0.0.1".to_string()).await? {
            return Ok(port);
        }
    }

    Err(format!("No available port found in range {}-{}", start, end))
}

#[tauri::command]
async fn is_port_available(port: u16, host: String) -> Result<bool, String> {
    match TcpListener::bind(format!("{}:{}", host, port)).await {
        Ok(_) => Ok(true),
        Err(e) if e.kind() == std::io::ErrorKind::AddrInUse => Ok(false),
        Err(e) => Err(format!("Failed to check port {}: {}", port, e)),
    }
}

// 日志命令
#[tauri::command]
async fn write_log(message: String, level: String) -> Result<(), String> {
    match level.to_lowercase().as_str() {
        "error" => log::error!("{}", message),
        "warn" => log::warn!("{}", message),
        "info" => log::info!("{}", message),
        "debug" => log::debug!("{}", message),
        "trace" => log::trace!("{}", message),
        _ => log::info!("{}", message),
    }
    Ok(())
}

// 应用启动设置
pub fn setup(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let app_handle = app.handle();

    // 初始化日志插件
    app_handle.plugin(
        tauri_plugin_log::Builder::default()
            .target(tauri_plugin_log::Target::new(
                tauri_plugin_log::TargetKind::LogDir {
                    file_name: Some("app.log".to_string()),
                },
            ))
            .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepAll)
            .max_file_size(5 * 1024 * 1024) // 5MB
            .level(log::LevelFilter::Info)
            .build(),
    )?;

    // 创建必要的目录
    let app_local_data_dir = app_handle.path().app_local_data_dir()?;
    let data_dir = app_local_data_dir.join("data");
    let logs_dir = app_local_data_dir.join("logs");

    std::fs::create_dir_all(&data_dir)?;
    std::fs::create_dir_all(&logs_dir)?;

    log::info!("Created directories: data={}, logs={}", data_dir.display(), logs_dir.display());

    // 启动 sidecar（Node.js 后端）— 生产模式
    let app_handle_clone = app_handle.clone();
    tauri::async_runtime::spawn(async move {
        match start_sidecar(app_handle_clone).await {
            Ok(_) => log::info!("Sidecar started successfully"),
            Err(e) => log::warn!("Sidecar not started (expected in dev mode): {}", e),
        }
    });

    // 监听显示器缩放变化
    if let Some(window) = app_handle.get_webview_window("main") {
        let window_clone = window.clone();
        window.on_window_event(move |event| {
            if let tauri::WindowEvent::ScaleFactorChanged { .. } = event {
                let _ = window_clone.emit("display-scale-changed", "");
            }
        });
    }

    Ok(())
}

// 启动 Node.js sidecar 子进程
async fn start_sidecar(app_handle: AppHandle) -> Result<(), String> {
    // 获取数据目录和迁移目录
    let data_dir = app_handle
        .path()
        .app_local_data_dir()
        .map_err(|e| format!("Failed to get app local data dir: {}", e))?
        .join("data");

    let resource_dir = app_handle
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource dir: {}", e))?;

    let migrations_dir = resource_dir.join("drizzle");

    log::info!("Starting sidecar with DATA_DIR={}", data_dir.display());
    log::info!("MIGRATIONS_DIR={}", migrations_dir.display());

    // 尝试启动 sidecar
    let shell = app_handle.shell();
    let (mut rx, mut _child) = shell
        .sidecar("storyloom-sidecar")
        .map_err(|e| format!("Failed to create sidecar command: {}", e))?
        .env("DATA_DIR", &data_dir)
        .env("MIGRATIONS_DIR", &migrations_dir)
        .env("NODE_ENV", "production")
        .env("STORYLOOM_SIDECAR", "1")
        .spawn()
        .map_err(|e| format!("Failed to spawn sidecar: {}", e))?;

    log::info!("Sidecar spawned, waiting for ready signal...");

    // 监听 stdout 解析就绪信号
    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(line_bytes) => {
                let line = String::from_utf8_lossy(&line_bytes);
                log::info!("[sidecar stdout] {}", line.trim());
                // 尝试解析 JSON: {"type":"ready","port":3001}
                if let Ok(json) = serde_json::from_str::<serde_json::Value>(&line) {
                    if json.get("type").and_then(|v| v.as_str()) == Some("ready") {
                        if let Some(port) = json.get("port").and_then(|v| v.as_u64()) {
                            log::info!("Sidecar ready on port {}", port);
                            SERVER_PORT.store(port as u16, Ordering::Relaxed);
                            // 通知前端
                            if let Some(window) = app_handle.get_webview_window("main") {
                                let _ = window.emit("server-port", port as u16);
                            }
                            // sidecar 已就绪，继续运行但不要阻塞
                            return Ok(());
                        }
                    }
                }
            }
            CommandEvent::Stderr(line_bytes) => {
                let line = String::from_utf8_lossy(&line_bytes);
                log::warn!("[sidecar stderr] {}", line.trim());
            }
            CommandEvent::Error(err) => {
                log::error!("[sidecar error] {}", err);
                return Err(format!("Sidecar error: {}", err));
            }
            CommandEvent::Terminated(payload) => {
                log::info!(
                    "[sidecar terminated] code={:?}, signal={:?}",
                    payload.code,
                    payload.signal
                );
                return Err("Sidecar terminated unexpectedly".to_string());
            }
            _ => {}
        }
    }

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_focus();
                let _ = window.unminimize();
            }
        }))
        .setup(|app| {
            setup(app)
        })
        .invoke_handler(tauri::generate_handler![
            read_file,
            write_file,
            delete_file,
            list_dir,
            get_user_data_path,
            get_app_path,
            get_server_port,
            set_server_port,
            find_available_port,
            is_port_available,
            write_log,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
