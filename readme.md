**Introduction** 

[Blogify](https://blog-house.netlify.app/) is a blog platform for reading and writing blogs. Users can read, publish, edit, and delete blogs. Go ahead; create an account and share your wonderful ideas.

**Running The App Locally**
1. Clone [blog-backend](https://github.com/MohammadAl-khatib/blog-backend).
2. Open project directory and run `nvm use` to set proper Node version.
3. Then run `npm i` to install dependencies.
4. Set `.env` file in the root of the project, check `.env.example` for reference.
5. Run `node index.js`, port is set to 4000.


**Project Design Pattern**

This app represents the model and controller side of an MVC project, the view is a [NextJS app](https://github.com/MohammadAl-khatib/blog-frontend) that handles the user interface. Data flows from a MongoDB in the cloud through this app to the front end for rendering.

Choosing MVC design pattern would help us:
1. Maintain the project, as the business and data logic is encapsulated in the models, interaction between UI and the data layer is handled by the controllers, and the view would manage rendering the UI.
2. It is a common pattern, which makes it easier for other developers to get onboard.
3. Work can be split between teams.

*Note*: Didn't choose a monorepo as it becomes very large with time, the frontend part is large, so it has its own repo.

**CI/CD**

On each pull request, the flow would be as follows:
1. Running eslint, merge would be blocked in case failed.
2. Running unit test, merge would be blocked in case failed.
3. [Render](https://dashboard.render.com/) would create a test link for each PR to be tested.
4. After acceptance from QA, the branch would be merged.
5. [Render](https://dashboard.render.com/) is configured to re-deploy each time a commit is added to the main branch.

*Important*: [check CI/CD in action](https://github.com/MohammadAl-khatib/blog-backend/pull/4)

**Features**
1. Whitelisting so this app is not accessible except for certain origins.
2. User authentication using JWT so no need for session cookies.
3. File handling for storing assets (Better use a CDN).

**Future Enhancements**
1. Modify Post Model to accept likes and comments.
2. Full test coverage including Models directory and `index.js` file in the root.
3. Setup a local MongoDB server for local testing instead of the cloud.