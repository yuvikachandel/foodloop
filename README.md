# FoodLoop 🍃
### Smart Food Redistribution Platform

FoodLoop is an AI-powered food redistribution platform designed to reduce food waste by connecting food donors with NGOs and volunteers.

The platform provides a digital space where restaurants, college canteens, event organizers, and other food providers can list surplus edible food. NGOs can discover and request available donations, while volunteers can help coordinate food pickups and deliveries.

Our goal is to make food redistribution more accessible, organized, and efficient through technology.

---

## 🎯 Project Objectives

- Reduce food wastage by encouraging responsible redistribution.
- Connect food donors with NGOs and charitable organizations.
- Make surplus food listings easier to discover and manage.
- Coordinate pickup and delivery through volunteers.
- Use AI-powered assistance to help users navigate the platform.

## ✨ Key Features

- **Role-Based Access:** Separate experiences for Donors, NGOs, Volunteers, and Administrators.
- **Food Listings:** Create and manage surplus food donations.
- **Donation Discovery:** Browse available food donations.
- **Donation Requests:** Allow NGOs to request available food.
- **Volunteer Coordination:** Support food pickup and delivery management.
- **Dashboard Management:** Dedicated dashboards for different user roles.
- **AI Chatbot:** Botpress-powered assistant to help users with FoodLoop-related questions.
- **Responsive Interface:** Designed to provide a user-friendly experience across devices.

## 👥 User Roles

| Role | Responsibility |
|---|---|
| Donor | Lists surplus edible food |
| NGO | Discovers and requests food donations |
| Volunteer | Helps coordinate pickups and deliveries |
| Admin | Monitors platform activities |

## 🛠️ Technology Stack

**Frontend**
- React
- TypeScript
- Tailwind CSS
- Vite
- Lucide React

**Backend and Database**
- Supabase
- Supabase Authentication
- Supabase JavaScript Client

**AI Integration**
- Botpress – AI chatbot integration

**Development and AI Tools**
- Bolt.new
- ChatGPT
- Gemini (if used in the project workflow)

## ⚙️ Getting Started

Follow these steps to run FoodLoop locally.

### 1. Clone the repository

```bash
git clone https://github.com/yuvikachandel/foodloop.git
```

### 2. Navigate to the project directory

```bash
cd foodloop
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Replace the placeholder values with your actual Supabase project credentials.

**Important:** Never upload secret keys, passwords, or service-role credentials to GitHub.

### 5. Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal to access FoodLoop.

## 📁 Project Structure

```text
foodloop/
│
├── src/                  # Application source code
├── supabase/             # Supabase-related files
├── public/               # Static assets (if present)
├── index.html            # Main HTML file
├── package.json          # Project dependencies
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```

## 🤖 AI Tools and Prompt Engineering

AI tools are used during the development process to support planning, website generation, refinement, and testing.

The project follows prompt engineering concepts such as:

- Role-based prompting
- Context-based prompting
- Step-by-step prompting
- Structured prompting using the Five-Part Prompt Framework
- Prompt refinement and optimization
- Response evaluation

The development process includes documenting initial prompts, modified prompts, AI-generated outputs, and improvements made throughout the project.

## 🌱 Expected Impact

FoodLoop aims to:

- Reduce avoidable food waste.
- Improve access to surplus edible food.
- Strengthen collaboration between donors, NGOs, and volunteers.
- Encourage sustainable food redistribution practices.

## 🔮 Future Scope

- Improved donor and NGO matching.
- Real-time donation and pickup notifications.
- Location-based donation discovery.
- More advanced AI assistance.
- Analytics for food redistribution and waste reduction.

## 🔐 Food Safety

FoodLoop is intended for the redistribution of safe, edible surplus food only. Donors should provide accurate food information, and all participants should follow appropriate food handling, storage, and pickup practices.

## 👩‍💻 Project Information

**Project Name:** FoodLoop  
**Project Type:** AI-Powered Web Application  
**Domain:** Food Technology / Social Impact  
**Repository:** [GitHub – FoodLoop](https://github.com/yuvikachandel/foodloop)

---

*Built with the aim of turning surplus food into meaningful impact.*

**FoodLoop — Share More. Waste Less.**
