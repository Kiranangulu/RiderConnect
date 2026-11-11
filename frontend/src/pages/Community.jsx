
import { useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

import {
  Users,
  Search,
  Plus,
  MessageCircle,
  MapPin,
  Clock,
  HandHelping,
  Send,
  X,
  Bike,
  ShieldCheck,
  UserPlus,
  UserCheck
} from "lucide-react";

const initialPosts = [
  {
    id: 1,
    author: "Ravi Kumar",
    zone: "MVP Colony",
    category: "UPDATE",
    time: "10 minutes ago",
    title: "Road condition update",
    description:
      "Traffic is moving slowly near MVP Circle. Consider checking an alternate road before starting your next delivery.",
    replies: 3
  },
  {
    id: 2,
    author: "Suresh",
    zone: "Madhurawada",
    category: "HELP",
    time: "25 minutes ago",
    title: "Need roadside assistance",
    description:
      "My scooter has a starting issue near the main junction. Is anyone nearby who can help?",
    replies: 2
  },
  {
    id: 3,
    author: "Arun",
    zone: "Gajuwaka",
    category: "UPDATE",
    time: "1 hour ago",
    title: "Useful petrol station",
    description:
      "There is a petrol station near the main road with convenient access for delivery riders.",
    replies: 5
  }
];

const initialGroups = [
  {
    id: 1,
    name: "Visakhapatnam Riders",
    zone: "City-wide",
    members: 245,
    description: "Connect with delivery partners across Vizag."
  },
  {
    id: 2,
    name: "MVP Colony Riders",
    zone: "MVP Colony",
    members: 68,
    description: "Share local traffic and delivery updates."
  },
  {
    id: 3,
    name: "Madhurawada Riders",
    zone: "Madhurawada",
    members: 92,
    description: "Help riders and share useful local information."
  }
];

const emptyPost = {
  title: "",
  description: "",
  zone: "Visakhapatnam",
  category: "UPDATE"
};

function Community() {
  const [posts, setPosts] = useState(initialPosts);
  const [groups, setGroups] = useState(initialGroups);
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyPost);
  const [message, setMessage] = useState("");

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        activeTab === "ALL" || post.category === activeTab;

      const searchText =
        `${post.title} ${post.description} ${post.zone} ${post.author}`
          .toLowerCase();

      const matchesSearch = searchText.includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [posts, activeTab, search]);

  const createPost = (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.description.trim()) {
      setMessage("Please complete the post details.");
      return;
    }

    const newPost = {
      id: Date.now(),
      author: "You",
      zone: form.zone,
      category: form.category,
      time: "Just now",
      title: form.title.trim(),
      description: form.description.trim(),
      replies: 0
    };

    setPosts((previous) => [newPost, ...previous]);
    setForm(emptyPost);
    setShowForm(false);
    setActiveTab("ALL");
    setSearch("");
    setMessage("Your community post was created.");
  };

  const toggleGroup = (groupId) => {
    setJoinedGroups((previous) =>
      previous.includes(groupId)
        ? previous.filter((id) => id !== groupId)
        : [...previous, groupId]
    );
  };

  const createHelpRequest = () => {
    setForm({
      ...emptyPost,
      category: "HELP",
      title: "Need rider assistance",
      description: ""
    });

    setShowForm(true);
    setMessage("");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 min-w-0">
        <Header />

        <div className="p-5 md:p-8 space-y-7">

          {/* Heading */}
          <section className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                Rider Community
              </h1>

              <p className="text-slate-500 mt-2">
                Connect, communicate and support fellow delivery partners.
              </p>
            </div>

            <button
              onClick={() => {
                setForm(emptyPost);
                setShowForm(true);
                setMessage("");
              }}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-semibold"
            >
              <Plus size={19} />
              Create Post
            </button>
          </section>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm">
              {message}
            </div>
          )}

          {/* Community statistics */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Community Members
                  </p>
                  <h2 className="text-2xl font-bold mt-2 text-slate-800">
                    405
                  </h2>
                </div>
                <div className="bg-green-100 text-green-700 p-3 rounded-xl">
                  <Users size={23} />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Community Groups
                  </p>
                  <h2 className="text-2xl font-bold mt-2 text-slate-800">
                    {groups.length}
                  </h2>
                </div>
                <div className="bg-blue-100 text-blue-700 p-3 rounded-xl">
                  <Users size={23} />
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Your Joined Groups
                  </p>
                  <h2 className="text-2xl font-bold mt-2 text-slate-800">
                    {joinedGroups.length}
                  </h2>
                </div>
                <div className="bg-purple-100 text-purple-700 p-3 rounded-xl">
                  <UserCheck size={23} />
                </div>
              </div>
            </div>

          </section>

          {/* Help banner */}
          <section className="bg-gradient-to-r from-green-700 to-emerald-500 rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <HandHelping size={22} />
                  <span className="font-semibold">
                    Rider Assistance
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-bold">
                  Need help during a delivery?
                </h2>

                <p className="text-green-50 mt-2 text-sm">
                  Create an assistance request and connect with fellow riders.
                </p>
              </div>

              <button
                onClick={createHelpRequest}
                className="bg-white text-green-700 px-5 py-3 rounded-lg font-semibold hover:bg-green-50"
              >
                Request Assistance
              </button>

            </div>
          </section>

          {/* Community posts */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 md:p-6">

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">

              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Community Feed
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Updates and assistance requests from riders.
                </p>
              </div>

              <div className="relative w-full md:w-64">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search community..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-sm"
                />
              </div>

            </div>

            <div className="flex gap-2 flex-wrap mb-6">
              {["ALL", "UPDATE", "HELP"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                    activeTab === tab
                      ? "bg-green-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {tab === "ALL"
                    ? "All Posts"
                    : tab === "UPDATE"
                      ? "Updates"
                      : "Help Requests"}
                </button>
              ))}
            </div>

            <div className="space-y-5">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  No community posts found.
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="border border-slate-200 rounded-xl p-5 hover:border-green-300 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-3">

                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">
                          {post.author.charAt(0).toUpperCase()}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-800">
                            {post.author}
                          </p>

                          <p className="text-xs text-slate-500 mt-1">
                            {post.zone} · {post.time}
                          </p>
                        </div>
                      </div>

                      <span className={`self-start px-3 py-1 rounded-full text-xs font-semibold ${
                        post.category === "HELP"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {post.category === "HELP"
                          ? "Assistance Request"
                          : "Rider Update"}
                      </span>

                    </div>

                    <div className="mt-4">
                      <h3 className="font-bold text-slate-800">
                        {post.title}
                      </h3>

                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                        {post.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-5 mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
                      <span className="flex items-center gap-2">
                        <MapPin size={16} />
                        {post.zone}
                      </span>

                      <span className="flex items-center gap-2">
                        <MessageCircle size={16} />
                        {post.replies} replies
                      </span>
                    </div>

                  </article>
                ))
              )}
            </div>
          </section>

          {/* Rider groups */}
          <section>
            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-800">
                Rider Groups
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Find and join groups in your delivery area.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {groups.map((group) => {
                const joined = joinedGroups.includes(group.id);

                return (
                  <div
                    key={group.id}
                    className="bg-white border border-slate-200 rounded-xl p-5"
                  >
                    <div className="flex justify-between items-start">
                      <div className="bg-green-100 text-green-700 p-3 rounded-xl">
                        <Bike size={25} />
                      </div>

                      <ShieldCheck
                        size={20}
                        className="text-green-600"
                      />
                    </div>

                    <h3 className="font-bold text-slate-800 mt-4">
                      {group.name}
                    </h3>

                    <p className="text-sm text-slate-500 mt-2">
                      {group.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-4">
                      <span className="flex items-center gap-1">
                        <Users size={15} />
                        {group.members + (joined ? 1 : 0)} members
                      </span>

                      <span className="flex items-center gap-1">
                        <MapPin size={15} />
                        {group.zone}
                      </span>
                    </div>

                    <button
                      onClick={() => toggleGroup(group.id)}
                      className={`w-full mt-5 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 ${
                        joined
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {joined ? (
                        <>
                          <UserCheck size={17} />
                          Joined
                        </>
                      ) : (
                        <>
                          <UserPlus size={17} />
                          Join Group
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <p className="text-center text-xs text-slate-400 pb-3">
            RiderConnect Community · Sample demonstration content
          </p>

        </div>
      </main>

      {/* Create post modal */}
      {showForm && (
        <div className="fixed inset-0 z-[1000] bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6">

            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Create Community Post
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Share a useful update or request assistance.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg hover:bg-slate-100"
                aria-label="Close form"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={createPost} className="space-y-4">

              <div>
                <label className="block text-sm font-medium mb-2">
                  Post Type
                </label>

                <select
                  value={form.category}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category: event.target.value
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg p-3"
                >
                  <option value="UPDATE">Rider Update</option>
                  <option value="HELP">Assistance Request</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Post Title
                </label>

                <input
                  required
                  maxLength={100}
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value
                    })
                  }
                  placeholder="Enter a title"
                  className="w-full border border-slate-300 rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>

                <textarea
                  required
                  maxLength={500}
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      description: event.target.value
                    })
                  }
                  placeholder="Write your message..."
                  className="w-full border border-slate-300 rounded-lg p-3 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Delivery Zone
                </label>

                <input
                  required
                  maxLength={80}
                  value={form.zone}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      zone: event.target.value
                    })
                  }
                  className="w-full border border-slate-300 rounded-lg p-3"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-slate-300 rounded-lg p-3 font-semibold text-slate-600"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white rounded-lg p-3 font-semibold flex items-center justify-center gap-2"
                >
                  <Send size={17} />
                  Publish Post
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Community;
