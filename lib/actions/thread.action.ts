"use server";

import Thread from "@/lib/models/thread.model";
import User from "@/lib/models/user.model";
import { revalidatePath } from "next/cache";
import { connectToDB } from "@/lib/mongoose";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}
export async function createThread({ text, author, communityId, path }: Params) {
  try {
    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    // Update user model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

export async function fetchThreds(pageNumber = 1, pageSize = 20) {
  try {
    connectToDB();

    // Calculate the number of posts to skip
    const skipAmount = (pageNumber - 1) * pageSize;
    // Fetch the posts that have no parents (top-level threads...)
    const threadsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: "desc" })
      .skip(skipAmount)
      .limit(pageSize)
      .populate({ path: "author", model: User })
      .populate({
        path: "children",
        populate: {
          path: "author",
          model: User,
          select: "_id name parentId image",
        },
      });

    const totalPostsCount = await Thread.countDocuments({ parentId: { $in: [null, undefined] } });

    const threads = await threadsQuery.exec();

    const isNext = totalPostsCount > skipAmount + threads.length;

    return { threads, isNext };
  } catch (e) {}
}

export async function fetchThreadById(id: string) {
  try {
    connectToDB();

    // TODO: Populate Community
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: { path: "author", model: User, select: "_id id name parentId image" },
          },
        ],
      })
      .exec();
    return thread;
  } catch (e: any) {
    throw new Error(`Error fetching thread: ${e.message}`);
  }
}
