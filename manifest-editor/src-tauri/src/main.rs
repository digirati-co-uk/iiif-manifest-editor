#![cfg_attr(
all(not(debug_assertions), target_os = "windows"),
windows_subsystem = "windows"
)]

use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

fn main() {
  let about_menu = Submenu::new("Manifest editor", Menu::new()
    .add_native_item(MenuItem::Hide)
    .add_native_item(MenuItem::HideOthers)
    .add_native_item(MenuItem::ShowAll)
    .add_native_item(MenuItem::Separator)
    .add_native_item(MenuItem::Quit));

  let edit_menu = Submenu::new("Edit", Menu::new()
    .add_native_item(MenuItem::Undo)
    .add_native_item(MenuItem::Redo)
    .add_native_item(MenuItem::Separator)
    .add_native_item(MenuItem::Cut)
    .add_native_item(MenuItem::Copy)
    .add_native_item(MenuItem::Paste)
    .add_native_item(MenuItem::SelectAll));

  let view_menu = Submenu::new("View", Menu::new()
    .add_native_item(MenuItem::EnterFullScreen));

  let window_menu = Submenu::new("Window", Menu::new()
    .add_native_item(MenuItem::Minimize)
    .add_native_item(MenuItem::Zoom));

  let help_menu = Submenu::new("Help", Menu::new()
    .add_item(CustomMenuItem::new("Learn More", "Learn More")));

  let create = CustomMenuItem::new("new".to_string(), "New");
  let open = CustomMenuItem::new("open".to_string(), "Open File...");
  let open_url = CustomMenuItem::new("open-url".to_string(), "Open Location...");
  let export = CustomMenuItem::new("export".to_string(), "Export...");

  let file_menu = Submenu::new("File", Menu::new()
    .add_item(create)
    .add_item(open)
    .add_item(open_url)
    .add_native_item(MenuItem::Separator)
    .add_item(export));

  let menu = Menu::new()
    .add_submenu(about_menu)
    .add_submenu(file_menu)
    .add_submenu(edit_menu)
    .add_submenu(view_menu)
    .add_submenu(window_menu)
    .add_submenu(help_menu);

  let context = tauri::generate_context!();
  tauri::Builder::default()
    .menu(menu)
    .run(context)
    .expect("error while running tauri application");
}
