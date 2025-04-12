async function loadEmergencies() {
    const tbody = document.getElementById('emergencyBody');
    const lastUpdated = document.getElementById('lastUpdated');
    
    try {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center">
                    <div class="spinner-border text-danger" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </td>
            </tr>
        `;

        const response = await fetch('http://localhost:3000/api/emergencies');
        if (!response.ok) throw new Error('Failed to fetch');
        
        const emergencies = await response.json();
        
        lastUpdated.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
        
        if (emergencies.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        <i class="fas fa-check-circle fa-2x mb-2"></i>
                        <p>No emergencies found</p>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = emergencies.map(emergency => `
            <tr>
                <td>
                    <i class="fas fa-user-circle"></i>
                    ${emergency.userId?.name || 'Unknown'}
                </td>
                <td>
                    <i class="fas fa-capsules"></i>
                    ${emergency.medicationId?.medicationName || 'Unknown'}
                </td>
                <td>
                    <i class="far fa-clock"></i>
                    ${new Date(emergency.missedTime).toLocaleString()}
                </td>
                <td>
                    <span class="badge ${emergency.status === 'resolved' ? 'status-resolved' : 'status-unresolved'}">
                        ${emergency.status === 'resolved' ? 
                            '<i class="fas fa-check"></i>' : 
                            '<i class="fas fa-exclamation-circle"></i>'} 
                        ${emergency.status}
                    </span>
                </td>
                <td>
                    <button onclick="resolveEmergency('${emergency._id}')" 
                            class="btn btn-sm ${emergency.status === 'resolved' ? 'btn-secondary' : 'btn-primary'}"
                            ${emergency.status === 'resolved' ? 'disabled' : ''}>
                        <i class="fas fa-check-circle"></i>
                        ${emergency.status === 'resolved' ? 'Resolved' : 'Resolve'}
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger">
                    <i class="fas fa-exclamation-triangle fa-2x mb-2"></i>
                    <p>Error loading emergencies. Please try again.</p>
                </td>
            </tr>
        `;
    }
}

async function resolveEmergency(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/emergencies/${id}/resolve`, {
            method: 'POST'
        });
        
        if (!response.ok) throw new Error('Failed to resolve emergency');
        
        loadEmergencies();
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to resolve emergency. Please try again.');
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', loadEmergencies);

// Auto refresh every 30 seconds
setInterval(loadEmergencies, 30000);