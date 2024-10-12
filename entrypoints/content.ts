import editIcon from "~/assets/edit.svg";
import insertIcon from "~/assets/insert.svg";
import genIcon from "~/assets/generate.svg";
import reGenIcon from "~/assets/regenerate.svg";


export default defineContentScript({
  matches: ["*://*.linkedin.com/*"],
  main() {
    const modalHtml = `
      <div id="custom-modal" style="position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: none; justify-content: center; align-items: center; z-index: 4000;">
        <div id="modal-content" style="background: white; border-radius: 8px; width: 100%; max-width: 570px; padding: 20px;">
          <div id="messages" style="margin-top: 10px; max-height: 200px; overflow-y: auto; padding: 10px; display: flex; flex-direction: column;"></div>
          <div style="margin-bottom: 10px;">
            <input id="input-text" type="text" placeholder="Enter your prompt..." style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;"/>
          </div>
          <div style="text-align: right; margin-top: 12px;">
            <button id="insert-btn" style="background: #fff; color: #666D80; padding: 8px 16px; border: 2px solid #666D80; border-radius: 4px; cursor: pointer; display: none; margin-right: 10px;">
              <img src="${insertIcon}" alt="Insert" style="vertical-align: middle; margin-right: 5px; width: 14px; height: 14px;"> 
              <b>Insert</b>
            </button>
            <button id="generate-btn" style="background: #007bff; color: white; padding: 8px 16px; border: 2px solid #007bff; border-radius: 4px; cursor: pointer;">
              <img src="${genIcon}" alt="Generate" style="vertical-align: middle; margin-right: 5px; width: 14px; height: 14px"> 
              <b>Generate</b>
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    const modal = document.getElementById("custom-modal") as HTMLDivElement;
    const modalContent = document.getElementById("modal-content") as HTMLDivElement;
    const generateBtn = document.getElementById("generate-btn") as HTMLButtonElement;
    const insertBtn = document.getElementById("insert-btn") as HTMLButtonElement;
    const inputText = document.getElementById("input-text") as HTMLInputElement;
    const messagesDiv = document.getElementById("messages") as HTMLDivElement;

    let lastGeneratedMessage = "";
    let parentElement: HTMLElement | null = null;
    let messageCount = 1;

    document.addEventListener("click", (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (
        target.matches(".msg-form__contenteditable") ||
        target.matches(".msg-form__contenteditable > p")
      ) {
        parentElement =
          target.closest(".msg-form__container") ||
          target.closest(".msg-form__contenteditable > p");
        if (parentElement && !parentElement.querySelector(".edit-icon")) {
          const icon = document.createElement("img");
          icon.className = "edit-icon";
          icon.src = editIcon;
          icon.alt = "Custom Icon";
          icon.style.position = "absolute";
          icon.style.bottom = "5px";
          icon.style.right = "5px";
          icon.style.width = "30px";
          icon.style.height = "30px";
          icon.style.cursor = "pointer";
          icon.style.zIndex = "1000";
          parentElement.appendChild(icon);

          icon.addEventListener("click", (e) => {
            e.stopPropagation();
            modal.style.display = "flex";
          });
        }
      }
    });

    document.addEventListener("click", (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        modal.style.display === "flex" &&
        !modalContent.contains(target) &&
        !target.classList.contains("edit-icon")
      ) {
        modal.style.display = "none";
        generateBtn.textContent = "Generate";
        insertBtn.style.display = "none"; // Hide the insert button when closing the modal
      }
    });

    const generateMessage = () => {
      const messages = [
        "Thank you for the opportunity! If you have any more questions or if there's anything else I can help you with, feel free to ask.",
      ];
      return messages[messageCount++ % messages.length];
    };

    generateBtn.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent click event from bubbling up to the document
      const inputValue = inputText.value.trim();
      if (!inputValue) return;
    
      const userMessageDiv = document.createElement("div");
      userMessageDiv.textContent = inputValue;
      Object.assign(userMessageDiv.style, {
        backgroundColor: "#DFE1E7",
        color: "#666D80",
        borderRadius: "12px",
        padding: "10px",
        marginBottom: "5px",
        textAlign: "right",
        maxWidth: "80%",
        alignSelf: "flex-end",
        marginLeft: "auto",
      });
      messagesDiv.appendChild(userMessageDiv);
    
      generateBtn.disabled = true;
      generateBtn.textContent = "Loading...";
      generateBtn.style.backgroundColor = "#666D80";
    
      setTimeout(() => {
        lastGeneratedMessage = generateMessage();
        const generatedMessageDiv = document.createElement("div");
        generatedMessageDiv.textContent = lastGeneratedMessage;
        Object.assign(generatedMessageDiv.style, {
          backgroundColor: "#DBEAFE",
          color: "#666D80",
          borderRadius: "12px",
          padding: "10px",
          marginBottom: "5px",
          textAlign: "left",
          maxWidth: "80%",
          alignSelf: "flex-start",
          marginRight: "auto",
        });

        messagesDiv.appendChild(generatedMessageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
        generateBtn.disabled = false;

        // Update button to show Regenerate with logo
        generateBtn.style.backgroundColor = "#007bff"; // Set the background color
        generateBtn.style.color = "white"; // Ensure text color is white
        generateBtn.innerHTML = `<img src="${reGenIcon}" alt="Regenerate" style="vertical-align: middle; margin-right: 5px; width: 16px; height: 16px"> <b>Regenerate</b>`;
        
        inputText.value = "";
        insertBtn.style.display = "inline-block";
      }, 500);
    });
    
    insertBtn.addEventListener("click", () => {
      console.log(1)
      if (lastGeneratedMessage && parentElement) {
        const messageParagraph = document.createElement("p");
        messageParagraph.textContent = lastGeneratedMessage;
        parentElement.appendChild(messageParagraph);
        insertBtn.style.display = "none";
        modal.style.display = "none";
      }
    });
  },
});
