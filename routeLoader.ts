import express, { RequestHandler } from "express";
import path from "path";
import fs from "fs/promises";
import { RouteModule } from "./types";
import { requirePermission } from "./middleware/permissions";

let currentApp: express.Application | null = null;
let routesLoaded = false;

export async function loadRoutes(
  app: express.Application,
  routesDir: string = path.join(__dirname, "routes")
): Promise<void> {
  currentApp = app;

  // Clear existing routes if they exist
  if (routesLoaded && app._router) {
    app._router.stack = app._router.stack.filter((layer: any) => {
      return !layer.route || !layer.route.path.startsWith("/api/");
    });
  }

  try {
    const files = await fs.readdir(routesDir);

    for (const file of files) {
      if (file.endsWith(".ts") || file.endsWith(".js")) {
        const modulePath = path.join(routesDir, file);
        delete require.cache[require.resolve(modulePath)];
        const routeModule = await import(modulePath);

        if (routeModule.default) {
          const routes: RouteModule | RouteModule[] = routeModule.default;
          const routeArray = Array.isArray(routes) ? routes : [routes];

          for (const route of routeArray) {
            const middleware = route.middleware || [];
            const handler: RequestHandler = async (req, res, next) => {
              try {
                await route.handler(req, res, next);
              } catch (error) {
                next(error);
              }
            };

            if (route.requiredPermissions) {
              middleware.push(
                ...route.requiredPermissions.map(requirePermission)
              );
            }

            app[route.method](`/api${route.path}`, ...middleware, handler);
            console.log(
              `Loaded route: ${route.method.toUpperCase()} /api${route.path}`
            );
          }
        }
      }
    }

    routesLoaded = true;
  } catch (error) {
    console.error("Error loading routes:", error);
    throw error;
  }
}

export function getRouter(): express.Application | null {
  return currentApp;
}
