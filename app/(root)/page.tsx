import { currentUser, UserButton } from "@clerk/nextjs";
import { fetchThreds } from "@/lib/actions/thread.action";
import ThreadCard from "@/components/cards/THreadCard";
import { fetchUser } from "@/lib/actions/user.action";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const result = await fetchThreds(1, 30);

  return (
    <>
      <h1 className={"head-text text-left"}>Home</h1>
      <section className={"mt-9 flex flex-col gap-10"}>
        {result?.threads.length === 0 ? (
          <p className={"no-result"}>No threads found</p>
        ) : (
          <>
            {result?.threads.map((thread) => (
              <ThreadCard
                key={thread._id}
                id={thread._id}
                currentUserId={user.id}
                parentId={thread.parentId}
                content={thread.text}
                author={thread.author}
                community={thread.community}
                createdAt={thread.createdAt}
                comments={thread.children}
              />
            ))}
          </>
        )}
      </section>
    </>
  );
}
