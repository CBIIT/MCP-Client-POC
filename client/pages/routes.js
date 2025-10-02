import AuthorizedImport from "./auth.js";

// REMOVED: import Home from "./home.js"; - Home page deleted, using Chat as root
const Chat = AuthorizedImport({ path: "./tools/chat/index.js" });

// REMOVED: Deleted tools no longer imported
// const ConsentCrafter = AuthorizedImport({ path: "./tools/consent-crafter/index.js" });
// const Translate = AuthorizedImport({ path: "./tools/translate.js" });
// const SemanticSearch = AuthorizedImport({ path: "./tools/semantic-search.js" });
// const Users = AuthorizedImport({ path: "./users/index.js", roles: [1] });
// const UserEdit = AuthorizedImport({ path: "./users/edit.js", roles: [1] });
// const UserProfile = AuthorizedImport({ path: "./users/profile.js" });
// const Usage = AuthorizedImport({ path: "./users/usage.js", roles: [1] });
// const UserUsage = AuthorizedImport({ path: "./users/user-usage.js", roles: [1] });

const { user } = await fetch("/api/session").then((res) => res.json());

// Simplified routes - Chat is now at root
const routes = [
  {
    path: "",
    title: "Chat",
    component: Chat,
    hidden: false,
  },
  {
    path: "*",
    title: "Chat",
    component: Chat,
    hidden: true,
  },
  {
    path: "/_",
    rawPath: !user ? "/api/login" : undefined,
    title: user ? user.firstName || "User" : "Login",
    class: "ms-lg-auto",
    children: user && [
      {
        rawPath: "/api/logout",
        title: "Logout",
      },
    ],
  },
];

export default routes;
