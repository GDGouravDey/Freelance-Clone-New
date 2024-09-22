import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import ProjectCard2 from './ProjectCard2';
import ProjectDetail from './ProjectDetail';
import axios from 'axios';

function FindProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedProjectDetails, setSelectedProjectDetails] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [applySuccess, setApplySuccess] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const accessToken = localStorage.getItem('accessToken');
                if (!accessToken) {
                    setError('No access token found. Please log in.');
                    setLoading(false);
                    return;
                }

                // Fetch available projects
                const response = await axios.get('http://localhost:8000/api/v1/offer/', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                });

                const fetchedProjects = response.data?.data || [];
                setProjects(fetchedProjects);

                // Fetch recommendations from another endpoint
                const recommendationsResponse = await axios.post('http://localhost:3001/recommend', {
                    skills: ['Python', 'Machine Learning', 'Data Science', 'Tensorflow']
                });
                console.log(recommendationsResponse.data.recommendations);

                setRecommendations(recommendationsResponse.data.recommendations);
            } catch (err) {
                setError('Failed to fetch projects. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const fetchProjectDetails = async (projectId) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await axios.get(`http://localhost:8000/api/v1/offer/get-offer/${projectId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            const fetchedProjectDetails = response.data?.data || null;
            console.log(fetchedProjectDetails);
            setSelectedProjectDetails(fetchedProjectDetails);
        } catch (err) {
            setError('Failed to fetch project details. Please try again later.');
        }
    };

    const handleApply = async (projectId, proposedRate) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await axios.post(
                `http://localhost:8000/api/v1/application/apply/${projectId}`,
                { proposedRate },
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                }
            );
            setApplySuccess('Application submitted successfully!');
        } catch (err) {
            setError('Failed to apply for the offer. Please try again later.');
        }
    };

    const handleProjectClick = (projectId) => {
        fetchProjectDetails(projectId);
        setSelectedProject(projectId);
    };

    const handleCloseDetail = () => {
        setSelectedProject(null);
        setSelectedProjectDetails(null);
    };

    const getSortedProjects = () => {
        // Map project ids with recommendations to create sorting logic
        return projects
            .filter(project => project.status === 'available')
            .map(project => {
                const recommendation = recommendations.find(rec => rec.title === project.title);
                return {
                    ...project,
                    match_score: recommendation ? recommendation.match_score : 0
                };
            })
            .sort((a, b) => b.match_score - a.match_score);
    };

    if (loading) {
        return (
            <div className="bg-gray-100 min-h-screen">
                <Navbar />
                <div className="text-black flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-100 min-h-screen">
                <Navbar />
                <div className="text-black flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <Navbar />
            <div className="text-black flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">
                {selectedProject ? (
                    <ProjectDetail
                        project={selectedProjectDetails}
                        onClose={handleCloseDetail}
                    />
                ) : (
                    projects.length === 0 ? (
                        <p>No available projects</p>
                    ) : (
                        getSortedProjects().map((project) => (
                            <ProjectCard2
                                className="cursor-pointer"
                                key={project._id}
                                project={project}
                                matchScore={project.match_score}
                                onClick={() => handleProjectClick(project._id)}
                                onApply={handleApply}
                            />
                        ))
                    )
                )}
                {applySuccess && <p className="text-green-500 mt-4">{applySuccess}</p>}
            </div>
        </div>
    );
}

export default FindProjects;
