// Show the rules popup when the "Instructions" button is clicked
document.getElementById('show-rules').addEventListener('click', function() {
  var rulesPopup = document.getElementById('rules-popup');
  rulesPopup.style.display = 'block'; // Display the rules popup
});

// Hide the rules popup when the "Close" button is clicked
document.getElementById('close-rules').addEventListener('click', function() {
  var rulesPopup = document.getElementById('rules-popup');
  rulesPopup.style.display = 'none'; // Hide the rules popup
});

// Function to show the modal
function showModal() {
  var modal = document.getElementById('myModal');
  modal.style.display = 'block'; // Display the modal
}

// Function to hide the modal
function hideModal() {
  var modal = document.getElementById('myModal');
  modal.style.display = 'none'; // Hide the modal
}
