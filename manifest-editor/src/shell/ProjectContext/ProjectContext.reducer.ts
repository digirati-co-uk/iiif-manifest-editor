import { ProjectActionsType, ProjectsLoadingStatus, ProjectState } from "./ProjectContext.types";
import produce from "immer";

export const projectContextReducer = produce(function projectContextReducer(
  state: ProjectState,
  action: ProjectActionsType
) {
  if (state.current) {
    switch (action.type) {
      // Single project actions
      case "removePublication":
        state.current.publications = state.current.publications.filter((p) => p.id !== action.payload);
        break;
      case "saveProject":
        state.current.metadata.modified = Date.now();
        break;
      case "updateDetails":
        state.current.name = action.payload.name;
        state.current.filename = action.payload.filename;
        break;
      case "updateStorage":
        state.current.storage = action.payload;
        break;
      case "createPublication": {
        if (!state.current.publications.find((s) => s.id === action.payload.id)) {
          state.current.publications.push(action.payload);
        }
        break;
      }
      case "updateThumbnail":
        state.current.thumbnail = action.payload;
        break;
      case "updateSettings":
        state.current.settings = action.payload;
        break;
      case "updatePublication": {
        const found = state.current.publications.find((s) => s.id === action.payload.id);
        if (found) {
          found.config = action.payload.config;
        }
        break;
      }
    }
  }
  switch (action.type) {
    case "load": {
      state.allProjects = action.payload.allProjects;
      state.current = action.payload.current;
      state.loadingStatus = action.payload.loadingStatus;
      break;
    }
    // Navigate project actions.
    case "forkProject":
      // This is probably all behind the scenes.
      break;
    case "deleteProject":
      state.allProjects = state.allProjects.filter((p) => p.id !== action.payload);
      if (state.current && state.current.id === action.payload) {
        state.current = null;
      }
      break;
    case "deselectProject":
      state.current = null;
      break;
    case "createProject":
      state.allProjects.push(action.payload);
      state.current = action.payload;
      break;
    case "switchProject":
      state.current = state.allProjects.find((p) => p.id === action.payload) || null;
      break;
    case "setLoadingStatus":
      state.loadingStatus = action.payload;
      break;
  }
});

export function getDefaultProjectContextState(
  status: ProjectsLoadingStatus | null = {
    loading: false,
    loaded: true,
    lastLoaded: 0,
  }
): ProjectState {
  return {
    allProjects: [],
    current: null,
    loadingStatus: status,
  };
}
