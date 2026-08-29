import {
  DeleteIntentFromWorkspace,
  SaveIntentToWorkspace,
  ValidateIntent,
} from '../../domain/contracts.js';

export type AppDeps = {
  validateIntent: ValidateIntent;
  saveIntentToWorkspace: SaveIntentToWorkspace;
  deleteIntentFromWorkspace: DeleteIntentFromWorkspace;
};
