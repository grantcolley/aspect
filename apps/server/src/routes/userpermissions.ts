import { Router, Request, Response } from "express";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();

router.get(
  "/",
  asyncHandler(async (_req: Request, res: Response) => {
    res.json(_req.userPermissions);
  })
);

export default router;
