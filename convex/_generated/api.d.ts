/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as createProjectWithVersion from "../createProjectWithVersion.js";
import type * as cronHelpers_imageKit from "../cronHelpers/imageKit.js";
import type * as cronHelpers_projectCleanup from "../cronHelpers/projectCleanup.js";
import type * as cronHelpers_projectMutations from "../cronHelpers/projectMutations.js";
import type * as cronHelpers_projectQueries from "../cronHelpers/projectQueries.js";
import type * as cronJobs from "../cronJobs.js";
import type * as crons from "../crons.js";
import type * as helpers_userDeletion from "../helpers/userDeletion.js";
import type * as projects from "../projects.js";
import type * as reserveProject from "../reserveProject.js";
import type * as storageConfig from "../storageConfig.js";
import type * as user from "../user.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  createProjectWithVersion: typeof createProjectWithVersion;
  "cronHelpers/imageKit": typeof cronHelpers_imageKit;
  "cronHelpers/projectCleanup": typeof cronHelpers_projectCleanup;
  "cronHelpers/projectMutations": typeof cronHelpers_projectMutations;
  "cronHelpers/projectQueries": typeof cronHelpers_projectQueries;
  cronJobs: typeof cronJobs;
  crons: typeof crons;
  "helpers/userDeletion": typeof helpers_userDeletion;
  projects: typeof projects;
  reserveProject: typeof reserveProject;
  storageConfig: typeof storageConfig;
  user: typeof user;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
