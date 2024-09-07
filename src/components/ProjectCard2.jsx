import { React, useState } from 'react';


function ProjectCard2({ project, className, onClick, matchScore, onApply }) {
    const {
        title,
        description,
        employer,
        skills,
        minSalary,
        maxSalary,
        finalSalary,
        duration,
        status,
    } = project;

    const [showRateInput, setShowRateInput] = useState(true); // State to control input visibility
    const [proposedRate, setProposedRate] = useState('');

    const handleApplyClick = () => {
        // Toggle the visibility of the proposed rate input field
        setShowRateInput(true);
    };

    const handleSubmitClick = () => {
        if (!proposedRate) {
            alert('Please enter a proposed rate.');
            return;
        }
        onApply(project._id, proposedRate);
        setShowRateInput(false); // Hide the input field after submitting
    };

    // Function to get background color based on project status
    const getStatusColor = () => {
        switch (status) {
            case 'completed':
                return 'bg-green-100'; // Light green for completed projects
            case 'in progress':
                return 'bg-yellow-100'; // Light yellow for in-progress projects
            case 'available':
                return 'bg-white'; // White for available projects
            default:
                return 'bg-gray-100'; // Default gray for other statuses
        }
    };

    return (
        <div
            className={`${getStatusColor()} ${className} shadow-lg rounded-lg p-6 min-w-[50%] mx-auto my-4 transition-transform transform hover:scale-105 cursor-pointer`}
            onClick={onClick}
        >
            <h2 className="text-xl font-bold mb-2">{title}</h2>
            <p className="text-gray-700 mb-4">{description}</p>

            <div className="mb-4">
                <h3 className="text-lg font-semibold">Employer:</h3>
                <p>{employer?.username} ({employer?.email})</p>
            </div>

            <div className="mb-4">
                <strong>Skills Required: </strong>
                {skills.length > 0 ? (
                    skills.map(skill => (
                        <span key={skill} className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                            {skill}
                        </span>
                    ))
                ) : (
                    <p>No skills specified</p>
                )}
            </div>

            <div className="mb-4">
                <strong>{`${status === 'available' ? 'Salary Range: ' : 'Salary: '}`}</strong>
                {status === 'available' ? (
                    `$${minSalary} - $${maxSalary}`
                ) : (
                    `$${finalSalary}`
                )}
            </div>

            <div className="mb-4">
                <strong>Duration: </strong>{duration} weeks
            </div>

            <div className="mb-4">
                <strong>Match Score: </strong>
                <span className="text-green-500 font-semibold">{matchScore ? `${matchScore.toFixed(2)}%` : 'N/A'}</span>
            </div>

            <div>
                <strong>Status: </strong>
                <span className={`inline-block px-2 py-0.5 rounded text-white ${
                    status === 'available' ? 'bg-green-500' :
                    status === 'in progress' ? 'bg-yellow-500' :
                    status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
                }`}>
                    {status}
                </span>
            </div>
        </div>
    );
}

export default ProjectCard2;
