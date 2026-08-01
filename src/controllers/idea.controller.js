import { PrismaClient } from "@prisma/client";
import { prisma } from "../../config/prisma.js";
import {
  createIdeaSchema,
  updateIdeaSchema,
} from "../validators/idea.validator.js";
import { analyzeIdeaStartUp } from "../services/groq.service.js";
import { ZodError } from "zod";
// import { analyzeStartupIdea } from "../services/gemini.service.js";

export const analyzeIdea = async (req, res) => {
  try {
    const data = createIdeaSchema.parse(req.body);

    // Save idea first
    const idea = await prisma.idea.create({
      data: {
        ...data,
        userId: req.user.id,
      },
    });

    // Generate AI analysis
    const analysis = await analyzeIdeaStartUp(data);

    // Save analysis
    const updatedIdea = await prisma.idea.update({
      where: {
        id: idea.id,
      },
      data: {
        analysis,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Idea analyzed successfully.",
      data: {
        id: updatedIdea.id,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        success: false,
        errors: error.issues,
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getIdeas = async (req, res) => {
  try {
    const ideas = await prisma.idea.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: ideas,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getIdeaById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const idea = await prisma.idea.findFirst({
      where: {
        id,
        userId: req.user.id,
      },
    });

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: "Idea not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: idea,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
