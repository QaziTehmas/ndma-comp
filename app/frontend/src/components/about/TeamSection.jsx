import "./TeamSection.css";
import fawzyPhoto from "../../assets/team/Fawzy.jpg";
import marwanPhoto from "../../assets/team/Marwan.jpg";
import nourPhoto from "../../assets/team/Nour.jpg";
import sultanPhoto from "../../assets/team/Sultan.png";
import hamdyPhoto from "../../assets/team/hamdy.jpg";

const teamMembers = [
  // {
  //   name: "Nour Eldeen Okbi",
  //   role: "Front-End / React Developer",
  //   bio: "Specialized in building responsive, data-driven applications using React, TypeScript, and modern UI frameworks.",
  //   imagePath: nourPhoto,
  //   details:
  //     "Skilled in React, Next.js, Tailwind, and state management, with hands-on GIS experience using ArcGIS JS SDK, Leaflet, ArcGIS Online, ArcGIS Pro, and building interactive geospatial dashboards.",
  // },
  {
    name: "Nour Eldeen Okbi",
    role: "Front-End / React Developer",
    bio: "Specialized in building responsive, data-driven applications (React, TypeScript) with a focus on Geospatial Web Solutions (GIS).",
    imagePath: nourPhoto,
    details:
      "Expert in React, Next.js, and Tailwind CSS. Proficient in state management and data integration. Specialized in GIS development using ArcGIS JS SDK, Leaflet, ArcGIS Online, and Pro to build interactive geospatial dashboards.",
  },
  {
    name: "Marwan El-mehy",
    role: "Backend Engineer",
    bio: "Designing and building scalable backend services and APIs to support real-time risk assessment and automated recognition systems.",
    imagePath: marwanPhoto,
    details:
      "Specializes in integrating data pipelines and service-level outputs with emergency response and decision-making platforms.",
  },
  {
    name: "Mohamed Sultan",
    role: "Data Scientist",
    bio: "Manages data lifecycle, including acquisition, cleaning, validation, and integration of satellite and sensor feeds.",
    imagePath: sultanPhoto,
    details:
      "Ensures the integrity و reliability of all geospatial data sources.",
  },
  {
    name: "Hamdy Sadoun",
    role: "Project Lead & Military Officer",
    bio: "Overseeing the strategic roadmap, team coordination, and system deployment.",
    imagePath: hamdyPhoto,
    details:
      "A dedicated leader focused on turning technology into real-world impact.",
  },
  {
    name: "Ahmed Fawzy Fawzy",
    role: "GIS & Front-End Developer",
    bio: "GIS Developer with expertise in Web GIS, spatial analysis, and front-end JavaScript and React.js development.",
    imagePath: fawzyPhoto,
    details:
      "Skilled in Python, ArcGIS, QGIS, GeoServer, and MySQL. Worked on AI-powered apps, spatial analysis tools, and dashboards. Enthusiastic about creativity and problem-solving.",
  },
];
export default function TeamSection() {
  return (
    <section className="team-section">
      <div className="team-container">
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-member-card">
              <div className="member-media">
                <div className="member-image-wrapper">
                  <img
                    src={member.imagePath}
                    alt={member.name}
                    className="member-photo"
                    onError={(e) => {
                      e.target.style.display = "none";
                      const fallback = e.target
                        .closest(".team-member-card")
                        .querySelector(".member-avatar-fallback");
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  <div className="member-avatar-fallback">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="member-image-overlay" />
                </div>

                <div className="member-info-default">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                </div>

                <div className="member-more">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                  <p className="member-bio">{member.bio}</p>
                  <p className="member-details">{member.details}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
