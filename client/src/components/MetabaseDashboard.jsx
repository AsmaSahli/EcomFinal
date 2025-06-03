import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MetabaseDashboard = ({ dashboardId }) => {
  const [embedUrl, setEmbedUrl] = useState('');

  useEffect(() => {
    const fetchEmbedUrl = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/metabase-embed-token/${dashboardId}`);
        setEmbedUrl(response.data.embedUrl);
      } catch (error) {
        console.error('Error fetching embed URL:', error);
      }
    };
    fetchEmbedUrl();
  }, [dashboardId]);

  return (
    <div style={{ width: '100%', height: '600px' }}>
      {embedUrl ? (
        <iframe
          src={embedUrl}
          frameBorder="0"
          width="100%"
          height="100%"
          allowtransparency 
          title="Metabase Dashboard"
        />
      ) : (
        <p>Loading dashboard...</p>
      )}
    </div>
  );
};

export default MetabaseDashboard;