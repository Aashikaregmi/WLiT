document.addEventListener('DOMContentLoaded', () => {
  // Toggle sidebar for mobile
  const toggleBtn = document.getElementById('toggle-sidebar');
  const sidebar = document.getElementById('sidebar');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active');
    });
  }

  // Profile page stats
  const profileStats = document.getElementById('profile-stats');
  const profileBusList = document.getElementById('profile-bus-list');
  if (profileStats && profileBusList) {
    // Mock user data
    const mockUser = {
      stats: { caught: 5, missed: 2, cancelled: 1 }
    };
    profileStats.innerHTML = `
      <p>Caught: ${mockUser.stats.caught}</p>
      <p>Missed: ${mockUser.stats.missed}</p>
      <p>Cancelled: ${mockUser.stats.cancelled}</p>
    `;
  }
});