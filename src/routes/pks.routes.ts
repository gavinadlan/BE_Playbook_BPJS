import { Router } from "express";
import { getAllPks, createPks } from "../controllers/pks.controller";
import upload from "../middlewares/upload";
import multer from "multer";
import { isAuthenticated } from "../middlewares/auth";

const router = Router();

router.use(isAuthenticated);

router.get("/", getAllPks);

router.post(
  "/",
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          message:
            err instanceof multer.MulterError
              ? "Ukuran file terlalu besar atau format tidak didukung"
              : err.message,
        });
      }
      next();
    });
  },
  createPks
);

export default router;
