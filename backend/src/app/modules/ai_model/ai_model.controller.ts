import { Request, Response } from "express";
import { setGuestUserIdCookie } from "../../../utils/cookie.util";
import httpStatus from "http-status";
import ApiError from "../../../errors/api_error";
import catchAsync from "../../../shared/catch_async";
import sendResponse from "../../../shared/send_response";
import { AiModelService } from "./ai_model.service";
import { IRemixPayload, ITranslatePayload, IChatPayload } from "./ai_model.interface";
import { reserveGuestQuota } from "./quota.service";
import {
  createGuestQuotaGuard,
  runWithQuotaCleanup,
} from "./quota.lifecycle";
import { generateWithGeminiStoriesStream } from "./ai_model.utils";

const aiModelGenerate = catchAsync(async (req: Request, res: Response) => {
  const prompt = req.body;
  const guard = res.locals.quotaRefundGuard;

  if (!guard) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Quota guard missing — checkRequestLimit middleware required"
    );
  }

  const controller = new AbortController();
  const onClose = () => {
    controller.abort();
  };
  req.on("close", onClose);

  try {
    await runWithQuotaCleanup(guard, async () => {
      const result = await AiModelService.aiModelGenerate(prompt, undefined, controller.signal);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Stories generated successfully!",
        data: result,
      });
    });
  } finally {
    req.off("close", onClose);
  }
});

const aiFreeModelGenerate = catchAsync(async (req: Request, res: Response) => {
  const prompt = req.body;
  let userId = req.cookies.userId as string | undefined;

  if (!userId) {
    userId = Math.random().toString(36).substring(7);
    setGuestUserIdCookie(res, userId);  // ✅ Fixed: now includes sameSite
  }

  const guard = createGuestQuotaGuard(userId);
  const controller = new AbortController();
  const onClose = () => {
    controller.abort();
  };
  req.on("close", onClose);

  try {
    await runWithQuotaCleanup(guard, async () => {
      await reserveGuestQuota(userId);
      const result = await AiModelService.aiFreeModelGenerate(prompt, controller.signal);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Story generated successfully!",
        data: result,
      });
    });
  } finally {
    req.off("close", onClose);
  }
});

const aiModelAlternateEndings = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const guard = res.locals.quotaRefundGuard;

  if (!guard) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Quota guard missing — checkRequestLimit middleware required"
    );
  }

  const controller = new AbortController();
  const onClose = () => {
    controller.abort();
  };
  req.on("close", onClose);

  try {
    await runWithQuotaCleanup(guard, async () => {
      const result = await AiModelService.aiModelAlternateEndings(payload, undefined, controller.signal);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Alternate endings generated successfully!",
        data: result,
      });
    });
  } finally {
    req.off("close", onClose);
  }
});

const aiFreeModelAlternateEndings = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    let userId = req.cookies.userId as string | undefined;

    if (!userId) {
      userId = Math.random().toString(36).substring(7);
      setGuestUserIdCookie(res, userId);  // ✅ Fixed: now includes sameSite
    }

    const guard = createGuestQuotaGuard(userId);
    const controller = new AbortController();
    const onClose = () => {
      controller.abort();
    };
    req.on("close", onClose);

    try {
      await runWithQuotaCleanup(guard, async () => {
        await reserveGuestQuota(userId);
        const result = await AiModelService.aiFreeModelAlternateEndings(payload, controller.signal);
        sendResponse(res, {
          statusCode: httpStatus.OK,
          success: true,
          message: "Alternate endings generated successfully!",
          data: result,
        });
      });
    } finally {
      req.off("close", onClose);
    }
  }
);

const aiModelGenerateStream = async (req: Request, res: Response) => {
  const { prompt, wordLength, numStories } = req.body;
  const guard = res.locals.quotaRefundGuard;

  if (!guard) {
    res.status(500).json({ error: "Quota guard missing" });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const controller = new AbortController();
  const onClose = () => {
    controller.abort();
  };
  req.on("close", onClose);

  try {
    await runWithQuotaCleanup(guard, async () => {
      try {
        await generateWithGeminiStoriesStream(
          prompt,
          wordLength ?? 250,
          numStories ?? 2,
          (chunk: string) => {
            res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
          },
          controller.signal
        );
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        res.write(`data: ${JSON.stringify({ error: errorMsg })}\n\n`);
        res.end();
        throw error;
      }
    });
  } finally {
    req.off("close", onClose);
  }
};

const aiModelRemix = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as IRemixPayload;
  const guard = res.locals.quotaRefundGuard;

  if (!guard) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Quota guard missing — checkRequestLimit middleware required"
    );
  }

  const controller = new AbortController();
  const onClose = () => {
    controller.abort();
  };
  req.on("close", onClose);

  try {
    await runWithQuotaCleanup(guard, async () => {
      const result = await AiModelService.aiModelRemix(payload, undefined, controller.signal);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Story remixed successfully!",
        data: result,
      });
    });
  } finally {
    req.off("close", onClose);
  }
});

const aiFreeModelRemix = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as IRemixPayload;
  let userId = req.cookies.userId as string | undefined;

  if (!userId) {
    userId = Math.random().toString(36).substring(7);
    setGuestUserIdCookie(res, userId);
  }

  const guard = createGuestQuotaGuard(userId);
  const controller = new AbortController();
  const onClose = () => {
    controller.abort();
  };
  req.on("close", onClose);

  try {
    await runWithQuotaCleanup(guard, async () => {
      await reserveGuestQuota(userId);
      const result = await AiModelService.aiFreeModelRemix(payload, controller.signal);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Story remixed successfully!",
        data: result,
      });
    });
  } finally {
    req.off("close", onClose);
  }
});

const aiModelTranslate = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as ITranslatePayload;
  const guard = res.locals.quotaRefundGuard;

  if (!guard) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Quota guard missing — checkRequestLimit middleware required"
    );
  }

  const controller = new AbortController();
  const onClose = () => {
    controller.abort();
  };
  req.on("close", onClose);

  try {
    await runWithQuotaCleanup(guard, async () => {
      const result = await AiModelService.aiModelTranslate(payload, undefined, controller.signal);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Story translated successfully!",
        data: result,
      });
    });
  } finally {
    req.off("close", onClose);
  }
});

const aiFreeModelTranslate = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as ITranslatePayload;
  let userId = req.cookies.userId as string | undefined;

  if (!userId) {
    userId = Math.random().toString(36).substring(7);
    setGuestUserIdCookie(res, userId);
  }

  const guard = createGuestQuotaGuard(userId);
  const controller = new AbortController();
  const onClose = () => {
    controller.abort();
  };
  req.on("close", onClose);

  try {
    await runWithQuotaCleanup(guard, async () => {
      await reserveGuestQuota(userId);
      const result = await AiModelService.aiFreeModelTranslate(payload, controller.signal);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Story translated successfully!",
        data: result,
      });
    });
  } finally {
    req.off("close", onClose);
  }
});

const aiModelChat = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as IChatPayload;
  const guard = res.locals.quotaRefundGuard;

  if (!guard) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Quota guard missing — checkRequestLimit middleware required"
    );
  }

  const controller = new AbortController();
  const onClose = () => {
    controller.abort();
  };
  req.on("close", onClose);

  try {
    await runWithQuotaCleanup(guard, async () => {
      const result = await AiModelService.aiModelChat(payload, undefined, controller.signal);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Chat response generated successfully!",
        data: result,
      });
    });
  } finally {
    req.off("close", onClose);
  }
});

const aiFreeModelChat = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as IChatPayload;
  let userId = req.cookies.userId as string | undefined;

  if (!userId) {
    userId = Math.random().toString(36).substring(7);
    setGuestUserIdCookie(res, userId);
  }

  const guard = createGuestQuotaGuard(userId);
  const controller = new AbortController();
  const onClose = () => {
    controller.abort();
  };
  req.on("close", onClose);

  try {
    await runWithQuotaCleanup(guard, async () => {
      await reserveGuestQuota(userId);
      const result = await AiModelService.aiFreeModelChat(payload, controller.signal);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Chat response generated successfully!",
        data: result,
      });
    });
  } finally {
    req.off("close", onClose);
  }
});

const aiStoryContinuation = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as { prompt: string; language?: string };
  const guard = res.locals.quotaRefundGuard;

  if (!guard) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Quota guard missing — checkRequestLimit middleware required"
    );
  }

  const controller = new AbortController();
  const onClose = () => {
    controller.abort();
  };
  req.on("close", onClose);

  try {
    await runWithQuotaCleanup(guard, async () => {
      const result = await AiModelService.aiModelStoryContinuation(payload, undefined, controller.signal);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Story continuation generated successfully!",
        data: result,
      });
    });
  } finally {
    req.off("close", onClose);
  }
});

const aiFreeStoryContinuation = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as { prompt: string; language?: string };
  let userId = req.cookies.userId as string | undefined;

  if (!userId) {
    userId = Math.random().toString(36).substring(7);
    setGuestUserIdCookie(res, userId);
  }

  const guard = createGuestQuotaGuard(userId);
  const controller = new AbortController();
  const onClose = () => {
    controller.abort();
  };
  req.on("close", onClose);

  try {
    await runWithQuotaCleanup(guard, async () => {
      await reserveGuestQuota(userId);
      const result = await AiModelService.aiFreeStoryContinuation(payload, controller.signal);
      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Story continuation generated successfully!",
        data: result,
      });
    });
  } finally {
    req.off("close", onClose);
  }
});

export const AiModelController = {
  aiModelGenerate,
  aiFreeModelGenerate,
  aiModelAlternateEndings,
  aiFreeModelAlternateEndings,
  aiModelGenerateStream,
  aiModelRemix,
  aiFreeModelRemix,
  aiModelTranslate,
  aiFreeModelTranslate,
  aiStoryContinuation,
  aiFreeStoryContinuation,
  aiModelChat,
  aiFreeModelChat,
};
