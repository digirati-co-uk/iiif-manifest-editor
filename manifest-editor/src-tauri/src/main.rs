#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

fn main() {
  let create = CustomMenuItem::new("new".to_string(), "New");
  let open = CustomMenuItem::new("open".to_string(), "Open File...");
  let open_url = CustomMenuItem::new("open-url".to_string(), "Open Location...");
  let export = CustomMenuItem::new("export".to_string(), "Export...");

  let submenu = Submenu::new("File", Menu::new()
    .add_item(create)
    .add_item(open)
    .add_item(open_url)
    .add_item(export)
    .add_native_item(MenuItem::Quit));

  let menu = Menu::new()
    .add_native_item(MenuItem::Copy)
    .add_item(CustomMenuItem::new("hide", "Hide"))
    .add_submenu(submenu);


  let context = tauri::generate_context!();
  tauri::Builder::default()
    .menu(menu)
    .run(context)
    .expect("error while running tauri application");
}
