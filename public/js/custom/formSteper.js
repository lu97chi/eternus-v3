let currentStep = 0; // Initialize to the first step (step-0)
const totalSteps = 7; // Total number of steps (step-0 to step-6)
const form = document.getElementById("multiStepForm");

/**
 * Moves the form to the next step with animations.
 */
function nextStep(sucess) {
  const currentElement = document.getElementById(`step-${currentStep}`);
  const nextElement = document.getElementById(`step-${currentStep + 1}`);

  if (nextElement) {
    // Add 'slide-out' class to animate out
    currentElement.classList.add("slide-out");

    // Force reflow to ensure transition starts
    void currentElement.offsetWidth;

    // Define the event handler for transition end
    function handleTransitionEnd() {
      // Hide the current step after transition
      currentElement.style.visibility = "hidden";

      // Remove 'active' and 'slide-out' classes
      currentElement.classList.remove("active", "slide-out");

      // Remove the event listener to prevent memory leaks
      currentElement.removeEventListener("transitionend", handleTransitionEnd);

      // Prepare and show the next step
      nextElement.style.visibility = "visible";
      nextElement.classList.add("active");

      // Update the current step counter
      currentStep++;

      // Adjust the form container height
      updateContainerHeight();

      // Focus on the input field of the new step
      const input = nextElement.querySelector("input, select, textarea");
      if (input) {
        input.focus();
      }

      // If navigating to the Review step, populate the review information
      if (currentStep === totalSteps - 1) {
        populateReviewInfo();
      }

      if (currentStep === totalSteps) {
        populateResultInfo(sucess);
      }
    }

    handleTransitionEnd();
  }
}

/**
 * Validates the current step and moves to the next step if valid.
 * @param {number} step - The current step number.
 */
function validateAndNextStep(step) {
  const stepElement = document.getElementById(`step-${step}`);
  const errorElement = document.getElementById(`error-step-${step}`);
  let isValid = true;

  // Select all required inputs within the current step
  const requiredInputs = stepElement.querySelectorAll("[required]");

  if (requiredInputs.length > 0) {
    // Check for radio button validations
    const radioInputs = stepElement.querySelectorAll(
      'input[type="radio"][required]'
    );
    if (radioInputs.length > 0) {
      // Validate that at least one radio button is selected
      isValid = Array.from(radioInputs).some((input) => input.checked);
    } else {
      // Validate text inputs and textareas to ensure they are not empty
      isValid = Array.from(requiredInputs).every(
        (input) => input.value.trim() !== ""
      );
    }
  }

  if (isValid) {
    if (errorElement) {
      errorElement.classList.add("d-none"); // Hide error message
    }
    nextStep(); // Proceed to the next step
  } else {
    if (errorElement) {
      errorElement.classList.remove("d-none"); // Show error message
    }
  }
}

/**
 * Adjusts the height of the form container to match the active step.
 */
function updateContainerHeight() {
  const container = document.querySelector(".form-container");
  const activeStep = document.querySelector(".form-step.active");
  if (activeStep) {
    // Temporarily set height to 'auto' to calculate the required height
    container.style.height = "auto";
    const height = activeStep.offsetHeight;
    container.style.height = height + "px";
  }
}

/**
 * Populates the Review Information step with user inputs.
 */
function populateReviewInfo() {
  const reviewContainer = document.getElementById("review-info");

  // Collect user inputs
  const brideName = document
    .querySelector('input[name="bride_name"]')
    .value.trim();
  const groomName = document
    .querySelector('input[name="groom_name"]')
    .value.trim();
  const weddingType =
    document.querySelector('input[name="wedding_type"]:checked')?.value ||
    "N/A";
  const budget =
    document.querySelector('input[name="budget"]:checked')?.value || "N/A";
  const contactMethod =
    document.querySelector('input[name="contact_method"]:checked')?.value ||
    "N/A";
  const additionalInfo =
    document.querySelector('textarea[name="additional_info"]').value.trim() ||
    "N/A";

  // Populate the review container with the collected information
  reviewContainer.innerHTML = `
    <p><strong>Bride's Name:</strong> ${brideName}</p>
    <p><strong>Groom's Name:</strong> ${groomName}</p>
    <p><strong>Wedding Type:</strong> ${weddingType}</p>
    <p><strong>Budget:</strong> ${budget}</p>
    <p><strong>Preferred Contact Method:</strong> ${contactMethod}</p>
    <p><strong>Additional Information:</strong> ${additionalInfo}</p>
  `;
  updateContainerHeight(); // Adjust the container height
}

/**
 * Populates the Success/Error case step with the result of the email sending.
 */
function populateResultInfo(success) {
  const resultTitle = document.getElementById("result-header");
  const resultDescription = document.getElementById("result-description");

  if (success) {
    resultTitle.innerText = "Email Sent Successfully!";
    resultDescription.innerText =
      "Thank you for reaching out to us. We will get back to you shortly.";
  } else {
    resultTitle.innerText = "Error Sending Email!";
    resultDescription.innerText = `
    An error occurred while sending the email. Please contact us directly.
    lu97is@gmail.com, sorry for the inconvenience.
    `;
  }
  updateContainerHeight(); // Adjust the container height
}

/**
 * Initializes the form on page load.
 */
document.addEventListener("DOMContentLoaded", () => {
  const firstStep = document.getElementById("step-0");
  if (firstStep) {
    firstStep.classList.add("active"); // Show the first step
    firstStep.style.visibility = "visible"; // Ensure visibility
    updateContainerHeight(); // Adjust container height accordingly
  }
});

form.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    validateAndNextStep(currentStep);
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Get the values from the form object
  const formData = new FormData(form);
  const formObject = Object.fromEntries(formData.entries());
  const {
    email,
    bride_name,
    groom_name,
    budget,
    weeding_type,
    additional_info,
  } = formObject;

  try {
    // Call the Vercel function
    const response = await fetch("/api/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        bride_name,
        groom_name,
        budget,
        weeding_type,
        additional_info,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log("Email sent successfully:", data);
      nextStep(true);
      await fetch("/api/customerFeedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          bride_name,
          groom_name,
          budget,
          weeding_type,
          additional_info,
        }),
      });
    } else {
      const error = await response.json();
      nextStep(false);
      console.error("Error sending email:", error);
    }
  } catch (err) {
    console.error("Error connecting to serverless function:", err);
    nextStep(false);
  }
});

document.addEventListener("resize", updateContainerHeight);
