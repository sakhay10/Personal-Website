// Music Player Widget Script
document.addEventListener("DOMContentLoaded", function () {
  const audioPlayer = document.getElementById("audio-player");
  const playPauseBtn = document.getElementById("play-pause-btn");
  const icon = playPauseBtn.querySelector("i");
  const playIconClass = "fa-play";
  const pauseIconClass = "fa-pause";

  // Function to update aria attributes and button classes
  function updateButtonAttributes(isPlaying) {
    if (isPlaying) {
      playPauseBtn.setAttribute("aria-label", "Pause music");
      playPauseBtn.setAttribute("aria-pressed", "true");
      playPauseBtn.classList.remove("play");
    } else {
      playPauseBtn.setAttribute("aria-label", "Play music");
      playPauseBtn.setAttribute("aria-pressed", "false");
      playPauseBtn.classList.add("play");
    }
  }

  // Initialize button state on page load
  if (!audioPlayer.paused) {
    icon.classList.add(pauseIconClass);
    icon.classList.remove(playIconClass);
    updateButtonAttributes(true);
  } else {
    icon.classList.add(playIconClass);
    icon.classList.remove(pauseIconClass);
    updateButtonAttributes(false);
  }

  // Toggle play/pause on button click with animation
  playPauseBtn.addEventListener("click", function () {
    if (
      icon.classList.contains("scale-fade-out") ||
      icon.classList.contains("scale-fade-in")
    ) {
      // Prevent multiple clicks during animation
      return;
    }
    icon.classList.add("scale-fade-out");
    icon.addEventListener(
      "animationend",
      function handler() {
        icon.removeEventListener("animationend", handler);
        icon.classList.remove("scale-fade-out");

        if (audioPlayer.paused) {
          audioPlayer.play();
          icon.classList.remove(playIconClass);
          icon.classList.add(pauseIconClass);
          updateButtonAttributes(true);
        } else {
          audioPlayer.pause();
          icon.classList.remove(pauseIconClass);
          icon.classList.add(playIconClass);
          updateButtonAttributes(false);
        }

        // Use requestAnimationFrame for smoother fade-in start with new animation classes
        requestAnimationFrame(() => {
          icon.classList.add("scale-fade-in");
          icon.addEventListener(
            "animationend",
            function handler2() {
              icon.removeEventListener("animationend", handler2);
              icon.classList.remove("scale-fade-in");
            },
            { once: true }
          );
        });
      },
      { once: true }
    );
  });

  // Reset button when audio ends
  audioPlayer.addEventListener("ended", function () {
    icon.classList.remove(pauseIconClass);
    icon.classList.add(playIconClass);
    updateButtonAttributes(false);
  });
});
