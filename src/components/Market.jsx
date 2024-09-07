import React, { useState, useEffect } from 'react';
import backgroundImage from '../assets/back.webp';
import Navbar2 from './Navbar2';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

const Market = () => {
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState('');
    const [skills, setSkills] = useState([]);
    const [recommendations, setRecommendations] = useState('');
    const [chartData, setChartData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [resumeUrl, setResumeUrl] = useState('');

    useEffect(() => {
        const handleSubmit = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('http://localhost:8000/api/v1/recommend', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ skills }),
                });
    
                if (response.ok) {
                    const data = await response.json();
                    setRecommendations(data.extractedText.replace(/\*/g, ''));
                } else {
                    console.error('Failed to get recommendations:', response.statusText);
                    alert('Failed to get recommendations');
                }
            } catch (error) {
                console.error('Error during recommendation generation:', error);
                alert('Error during recommendation generation');
            } finally {
                setIsLoading(false);
            }
        };
    
        const handleSubmit2 = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/v1/generate-chart-2', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ skills }),
                });
    
                if (response.ok) {
                    const data = await response.json();
                    // Ensure data is correctly formatted
                    const chartArray = data.extractedText.match(/\[.*\]/s)[0];
                    setChartData(JSON.parse(chartArray));
                } else {
                    console.error('Failed to get chart data:', response.statusText);
                    alert('Failed to get chart data');
                }
            } catch (error) {
                console.error('Error during chart data retrieval:', error);
                alert('Error during chart data retrieval');
            }
        };

        // Fetch recommendations first, then fetch the chart data
        const fetchData = async () => {
            await handleSubmit();
            await handleSubmit2();
        };
        
        fetchData();
    }, []);

    const renderBarChart = (data) => (
        <BarChart width={1200} height={600} data={data}>
            <XAxis
                dataKey="Domain"
                stroke="#8884d8"
                angle={0}
                textAnchor="middle"
                height={200}
            />
            <YAxis />
            <Tooltip wrapperStyle={{ width: 170, backgroundColor: '#ccc' }} />
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <Bar dataKey="Proficiency" fill="#8884d8" barSize={50} />
        </BarChart>
    );

    return (
        <div className="bg-gray-100 text-zinc-950 min-h-screen" style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
        }}>
            <Navbar2 />
            <div className="container mx-auto p-8" >
                {isLoading && <div className="mt-4 text-center">Loading...</div>}

                {recommendations && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-2">Recommendations:</h3>
                        <textarea
                            value={recommendations}
                            readOnly
                            className="w-full h-[110vh] p-4 border border-gray-300 rounded bg-white"
                        />
                    </div>
                )}

                {/* {recommendations && chartData.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-2">Bar Chart:</h3>
                        {renderBarChart(chartData)}
                    </div>
                )} */}
            </div>
        </div>
    );
};

export default Market;
