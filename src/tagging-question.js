import { LitElement, html, css } from 'lit';

class TaggingQuestion extends LitElement {

  static get properties() {
    return {
      question: { type: String }, // The question text
      imageUrl: { type: String }, // URL of the optional image
      tagsData: { type: Array }, // Array of tag objects { tag: string, correct: boolean, feedback: string }
    };
  }

  constructor() {
    super();
    this.question = '';
    this.imageUrl = '';
    this.tagsData = [];
    this.selectedTags = [];
    this.isChecking = false;
  }

  static get styles() {
    return css`
      :host {
        display: block;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
        margin-bottom: 20px;
      }
      img {
        max-width: 100%;
        height: auto;
        margin-bottom: 20px;
      }
      .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 20px;
      }
      .tag {
        padding: 8px 12px;
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 20px;
        cursor: pointer;
      }
      .selected {
        border-color: green;
      }
      .incorrect {
        border-color: red;
      }
      .feedback {
        margin-top: 10px;
        font-style: italic;
        color: #666;
      }
      .button-container {
        margin-top: 20px;
      }
    `;
  }

  render() {
    return html`
      ${this.imageUrl ? html`<img src="${this.imageUrl}" alt="Question Image">` : ''}
      <div>${this.question}</div>
      <div class="tags-container">
        ${this.shuffleTags().map(tag => html`
          <div class="tag ${this.selectedTags.includes(tag) ? 'selected' : ''}" @click="${() => this.toggleTag(tag)}">${tag}</div>
        `)}
      </div>
      <div class="button-container">
        <button @click="${this.checkAnswers}" ?disabled="${this.isChecking}">Check Answers</button>
        <button @click="${this.resetSelections}">Reset</button>
      </div>
      ${this.isChecking ? this.renderFeedback() : ''}
    `;
  }

  shuffleTags() {
    // Shuffle tags to display them in random order
    return [...this.tagsData.map(tagObj => tagObj.tag)].sort(() => Math.random() - 0.5);
  }

 
  checkAnswers() {
    // Set isChecking to true to show feedback
    this.isChecking = true;
    this.requestUpdate();
  }

  resetSelections() {
    // Reset selected tags
    this.selectedTags = [];
    this.isChecking = false;
    this.requestUpdate();
  }

  renderFeedback() {
    return html`
      <div>
        ${this.tagsData.map(tagObj => {
          const isSelected = this.selectedTags.includes(tagObj.tag);
          const isCorrect = tagObj.correct;
          return isSelected ? html`
            <div class="tag ${isCorrect ? 'correct' : 'incorrect'}">${tagObj.tag}</div>
            <div class="feedback">${isCorrect ? tagObj.feedback : `Incorrect - ${tagObj.feedback}`}</div>
          ` : '';
        })}
      </div>
    `;
  }
}

customElements.define('tagging-question', TaggingQuestion);