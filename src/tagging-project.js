
import { LitElement, html, css } from "lit";
import { DDD } from "@lrnwebcomponents/d-d-d/d-d-d.js";

export class TaggingQuestion extends DDD {
  static get tag() {
    return "tagging-question";
  }

  constructor() {
    super();
    this.image = "image";
    this.question = "question";
    this.answerSet = "default";
    this.tagOptions = [];
    this.selectedTags = [];
    this.submitted = false;
    this.loadTagsData();
    this.isSubmitDisabled = false;
  }

  static get styles() {
    return [
      super.styles,
      css`
        .tag-container {
        display:flex;
        padding:var(--ddd-spacing-2);
        margin: var(--ddd-spacing-8);
        border: solid 3px var(--ddd-theme-default-skyBlue);
        background:var(--ddd-theme-default-athertonViolet);
        }

       

        .image-container {
        width:300px;
        padding:var(--ddd-spacing-4);
        margin: var(--ddd-spacing-3);
        }

        .image {
          max-width: 120%;
          height:auto;
        }

        .tag-question {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
        }

        .tag-option-container {
          width: 100%;
          background:var(--ddd-theme-default-white);
          padding:var(--ddd-spacing-2);
          border: solid 3px var(--ddd-theme-default-skyBlue);
        }

        .submission-container {
          display: flex;
          overflow-y: auto;
          background:var(--ddd-theme-default-disabled);
          padding:var(--ddd-spacing-2);
          border: solid 3px var(--ddd-theme-default-skyBlue);
          margin-bottom: var(--ddd-spacing-8);
        }

        .user-choice-container {
          display: inline-flex;
          flex-wrap: wrap;
          overflow-y: auto;
          width: 100%;
          
        }

        #submit-button, #reset-button {
        font-family:var(--ddd-font-primary-regular);
        font-size: var(--ddd-font-size-4xs);
        text-transform: uppercase;
        cursor: pointer;
        border: var(--ddd-spacing-1) solid;
        padding: var(--ddd-spacing-2);
        margin:var(--ddd-spacing-1);
      
        }

        #submit-button {
          background-color: var(--ddd-theme-default-infoLight);;
        }

        #reset-button {
          margin-top: 10px;
          background-color: var(--ddd-theme-default-shrineTan);;
        }

        #submit-button:hover {
          background-color:var(--ddd-theme-default-alertImmediate);
        }

        #reset-button:hover {
          background-color: var(--ddd-theme-default-alertImmediate);
        }

        .option-container {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
        }

        .tag-option {
          
          padding: 8px 12px;
          border: 2px solid #ccc;
          border-radius: 8px;
          background-color: var(--ddd-theme-default-white);
          cursor: pointer;
          user-select: none;
          
       
        } 

        .tag-option.correct {
          outline: 4px solid  var(--ddd-theme-default-forestGreen);;
        }

        .tag-option.incorrect {
          outline: 4px solid var(--ddd-theme-default-original87Pink);
        }
        .feedback-container {
          display: flex;
          flex-direction: column; 
          background:var(--ddd-theme-default-disabled);
          padding:var(--ddd-spacing-4);
          border: solid 3px var(--ddd-theme-default-skyBlue);
        }
      `
    ];
  }
  render() {
    return html`
      <confetti-container id="confetti">
        <div class="tag-container ${this.submitted ? "submitted" : ""}">
          <div class="image-container">
            <slot name="image"></slot>
            <img class="image" src="${this.image}">
          </div>
          <div class="tag-question">
            <slot name="question"></slot>
            <p><span>${this.question}</span></p>
          </div>
          <div class="tag-option-container">
            <div class="submission-container">
              <div class="user-choice-container" @drop="${this.handleDropInAnswer}" @dragover="${this.allowDrop}">
                ${this.selectedTags.map(tag => html`
                  <div class="tag-option" draggable="true" @dragstart="${this.handleDragStart}" @dragend="${this.handleDragEnd}">${tag}</div>
                `)}
              </div>
              <button id="submit-button" @click="${this.submitAnswers}" ?disabled="${this.isSubmitDisabled}">Check Answers</button>
              <button id="reset-button" @click="${this.reset}">Reset</button>
            </div>
            <div class="option-container" @dragover="${this.allowDrop}">
              ${this.tagOptions.map(tagOption => html`
                <div class="tag-option" draggable="true" @dragstart="${this.handleDragStart}" @click="${this.handleTagClick}">${tagOption}</div>
              `)}
            </div>
          </div>
        </div>
      </confetti-container>
      <div class="feedback-container">
            <!-- Feedback will be rendered here -->
      </div>
    `;
  }
  
  applyFeedback() {
    if (this.submitted) {
      // Loop through selected tags
      this.selectedTags.forEach(tag => {
        // Find the corresponding answer object for this tag
        const tagAnswer = this.tagAnswers.find(answer => answer.hasOwnProperty(tag));
        if (tagAnswer) {
          // Apply correct/incorrect outline based on the answer
          const correct = tagAnswer[tag].correct;
          const tagElements = this.shadowRoot.querySelectorAll('.tag-option');
          tagElements.forEach(tagElement => {
            if (tagElement.textContent.trim() === tag) {
              tagElement.classList.toggle('correct', correct);
              tagElement.classList.toggle('incorrect', !correct);
            }
          });
          // Render feedback
          const feedbackContainer = this.shadowRoot.querySelector('.feedback-container');
          feedbackContainer.innerHTML += `<p>${tagAnswer[tag].feedback}</p>`;
        }
      });
    }
  }

  handleTagClick(e) {
    const tagOption = e.target.textContent.trim();
    
    // Check if the clicked tag is already in the solution area
    if (this.selectedTags.includes(tagOption)) {
      // If so, remove it
      this.removeTag(tagOption);
    } else {
      // Otherwise, add it to the solution area
      this.addTag(tagOption);
    }
  }

  loadTagsData() {
    fetch("./assets/tagging-answers.json")
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to fetch tags data");
        }
        return response.json();
      })
      .then(tagsData => {
        const tagSet = tagsData[this.answerSet];
        if (tagSet) {
          this.tagOptions = tagSet.tagOptions || [];
          this.tagAnswers = tagSet.tagAnswers || [];
          
          this.tagOptions = this.shuffleArray(this.tagOptions);
        } else {
          throw new Error(`tagSet '${this.answerSet}' not found`);
        }
      })
      .catch(error => {
        console.error("Error loading tags data: ", error);
      });
  }
  
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  firstUpdated() {
    super.firstUpdated();
    this.answerContainer = this.shadowRoot.querySelector(".user-choice-container");
    this.optionContainer = this.shadowRoot.querySelector(".option-container");
    this.answerContainer.addEventListener("dragover", this.allowDrop.bind(this));
    this.optionContainer.addEventListener("dragover", this.allowDrop.bind(this));
    this.answerContainer.addEventListener("drop", this.handleDrop.bind(this, true));
    this.optionContainer.addEventListener("drop", this.handleDrop.bind(this, false));
    const tagOptions = this.shadowRoot.querySelectorAll('.tag-option');
    
  }

  handleDragStart(e) {
    const tagOption = e.target.textContent.trim();
    e.dataTransfer.setData("text/plain", tagOption);
  }

  handleDragEnd(e) {
    const tagOption = e.target.textContent.trim();
    const sourceContainer = e.target.closest(".user-choice-container");
    if (sourceContainer) {
      this.removeTag(tagOption);
    }
  }

  allowDrop(e) {
    e.preventDefault();
  }

  handleDrop(isUserChoice, e) {
    e.preventDefault();
    const tagOption = e.dataTransfer.getData("text/plain");
    if (isUserChoice) {
      this.addTag(tagOption);
    } else {
      if (!this.selectedTags.includes(tagOption)) {
        if (!this.tagOptions.includes(tagOption)) {
          this.tagOptions.push(tagOption);
        }
      }
    }
  }
  

  
  addTag(tagOption) {
    if (!this.submitted && !this.selectedTags.includes(tagOption)) {
      this.selectedTags = [...this.selectedTags, tagOption];
      this.tagOptions = this.tagOptions.filter(tag => tag !== tagOption);
    }
  }

  removeTag(tagOption) {
    if (!this.submitted) {
      this.selectedTags = this.selectedTags.filter(tag => tag !== tagOption);
      this.tagOptions.push(tagOption);
    }
  }

//Disables submit button and ensures that confetti only appears when all answers are correct
  submitAnswers() {
      if (this.selectedTags.length === 0) {
    console.log('No tags selected. Please select at least one tag.');
    return;
  }
    this.submitted = true;
    this.applyFeedback();
    this.isSubmitDisabled = true;
    const allCorrect = this.selectedTags.every(tag => {
      const tagAnswer = this.tagAnswers.find(answer => answer.hasOwnProperty(tag));
      return tagAnswer ? tagAnswer[tag].correct : false;
    });
  
    if (allCorrect) {
      this.submitted = true;
      this.isSubmitDisabled = true;
      this.makeItRain();
    }
  }
  
  reset() {
    this.submitted = false;
    this.tagOptions = [...this.tagOptions, ...this.selectedTags];
    this.selectedTags = [];
  
    // Reset anything inside the feedback container
    const feedbackContainer = this.shadowRoot.querySelector('.feedback-container');
    feedbackContainer.innerHTML = '';
    this.isSubmitDisabled = false;
  }
  

  makeItRain() {
    import('@lrnwebcomponents/multiple-choice/lib/confetti-container.js').then((module) => {
      setTimeout(() => {
        this.shadowRoot.querySelector("#confetti").setAttribute("popped", "");
      }, 0);
    });
  }

  static get properties() {
    return {
      ...super.properties,
      image: { type: String, reflect: true },
      question: { type: String, reflect: true },
      answerSet: { type: String, reflect: true },
      tagOptions: { type: Array, attribute: "tag-options" },
      selectedTags: { type: Array, attribute: "selected-tags" },
      submitted: { type: Boolean, reflect: true },
      isSubmitDisabled: { type: Boolean }
      
    };
  }
}

globalThis.customElements.define(TaggingQuestion.tag, TaggingQuestion);
