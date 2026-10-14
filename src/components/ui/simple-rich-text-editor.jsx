import { useMemo } from "react";
import { Editor } from "@tinymce/tinymce-react";

export default function SimpleRichTextEditor({
  value,
  content, // Alias for value (used in forms)
  defaultValue,
  onChange,
  onChangeContent, // Alias for onChange (used in forms)
  onBlur,
  onInit,
  onEditorChange,
  height = 400,
  disabled = false,
  init: initOverrides = {},
}) {
  // Support both 'value' and 'content' props (content is used in forms)
  const actualValue = content !== undefined ? content : value;

  // Support both 'onChange' and 'onChangeContent' props
  const actualOnChange = onChangeContent || onChange;

  // Normalize values so TinyMCE never receives null/undefined and
  // support both controlled (value) and uncontrolled (defaultValue) usage.
  const isControlled = actualValue !== undefined;
  const normalizedValue = actualValue ?? "";
  const normalizedDefaultValue = defaultValue ?? "";

  const tinymceInit = useMemo(
    () => ({
      plugins: [
        "accordion",
        "advlist",
        "anchor",
        "autolink",
        "autoresize",
        "autosave",
        "charmap",
        "code",
        "codesample",
        "directionality",
        "emoticons",
        "fullscreen",
        "help",
        "image",
        "importcss",
        "insertdatetime",
        "link",
        "lists",
        "media",
        "nonbreaking",
        "pagebreak",
        "paste",
        "preview",
        "quickbars",
        "save",
        "searchreplace",
        "table",
        "visualblocks",
        "visualchars",
        "wordcount",
        "mediaembed",
        "powerpaste",
        "contextmenu",
      ],
      editimage_cors_hosts: ["picsum.photos"],
      menubar: "file edit view insert format tools table help",
      powerpaste_allow_local_images: true,
      width: "100%",
      toolbar:
        "undo redo | accordion accordionremove | blocks fontfamily fontsize | bold italic underline strikethrough | align numlist bullist | link image | table media | lineheight outdent indent| forecolor backcolor removeformat | charmap emoticons | code fullscreen preview | save print | pagebreak anchor codesample | ltr rtl",
      autosave_ask_before_unload: true,
      autosave_interval: "30s",
      autosave_prefix: "{path}{query}-{id}-",
      autosave_restore_when_empty: false,
      autosave_retention: "2m",
      image_advtab: false,
      image_prepend_url: "",
      images_upload_url: `${import.meta.env.VITE_API_URL}/common/image`,
      images_upload_base_path: "",
      images_upload_credentials: false,
      importcss_append: true,
      file_picker_callback: (callback, value, meta) => {
        if (meta.filetype === "image") {
          const input = document.createElement("input");
          input.setAttribute("type", "file");
          input.setAttribute("accept", "image/*");

          input.onchange = function () {
            const file = this.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("image", file, file.name);

            const xhr = new XMLHttpRequest();
            xhr.withCredentials = false;
            xhr.open("POST", `${import.meta.env.VITE_API_URL}/common/image`);

            xhr.onload = () => {
              if (xhr.status === 403) {
                alert("Image upload forbidden. Please try again.");
                return;
              }

              if (xhr.status < 200 || xhr.status >= 300) {
                alert(`Image upload failed. Error: ${xhr.status}`);
                return;
              }

              try {
                const json = JSON.parse(xhr.responseText);
                if (!json || typeof json.url !== "string") {
                  alert("Invalid image upload response. Please try again.");
                  return;
                }

                callback(json.url, { alt: file.name });
              } catch (e) {
                alert("Failed to process image upload. Please try again.");
                console.error("Failed to parse image upload response", e);
              }
            };

            xhr.onerror = () => {
              alert(
                "Image upload failed. Please check your connection and try again.",
              );
              console.error("Image upload XHR error", xhr.status);
            };

            xhr.send(formData);
          };

          input.click();
          return;
        }

        if (meta.filetype === "file") {
          const input = document.createElement("input");
          input.setAttribute("type", "file");
          input.onchange = function () {
            callback(this.value);
          };
          input.click();
        }

        if (meta.filetype === "media") {
          const input = document.createElement("input");
          input.setAttribute("type", "file");
          input.setAttribute("accept", "video/*");
          input.onchange = function () {
            callback(URL.createObjectURL(this.files[0]));
          };
          input.click();
        }
      },
      images_upload_handler: async (blobInfo, progress) =>
        new Promise((resolve, reject) => {
          const formData = new FormData();
          formData.append("image", blobInfo.blob(), blobInfo.filename());

          const xhr = new XMLHttpRequest();
          xhr.withCredentials = false;
          xhr.open("POST", `${import.meta.env.VITE_API_URL}/common/image`);

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              progress((e.loaded / e.total) * 100);
            }
          };

          xhr.onload = () => {
            if (xhr.status === 403) {
              reject({ message: "HTTP Error: " + xhr.status, remove: true });
              return;
            }

            if (xhr.status < 200 || xhr.status >= 300) {
              reject("HTTP Error: " + xhr.status);
              return;
            }

            const json = JSON.parse(xhr.responseText);

            if (!json || typeof json.url != "string") {
              reject("Invalid JSON: " + xhr.responseText);
              return;
            }

            resolve(json.url);
          };

          xhr.onerror = () => {
            reject(
              "Image upload failed due to a XHR Transport error. Code: " +
                xhr.status,
            );
          };

          xhr.send(formData);
        }),
      automatic_uploads: true,
      file_picker_types: "image",
      paste_data_images: true,
      // Paste configuration to preserve formatting from Word/documents
      paste_as_text: false,
      paste_remove_styles_if_webkit: false,
      paste_retain_style_properties: "all",
      paste_auto_cleanup_on_paste: false,
      paste_convert_word_fake_lists: true, // Enable Word list conversion
      paste_remove_spans: false,
      paste_remove_styles: false,
      paste_word_valid_elements:
        "p,br,strong,b,em,i,u,span,div,ol,ul,li,h1,h2,h3,h4,h5,h6,a[href],table,tr,td,th,tbody,thead,tfoot,img[src],font,blockquote,pre,code,sub,sup,strike,s",
      paste_merge_formats: true,
      paste_strip_class_attributes: "none",
      paste_webkit_styles: "all", // Preserve all styles including list styles
      paste_enable_default_filters: false, // Don't filter out list formatting
      paste_preprocess: (plugin, args) => {
        // Preserve Word formatting - only remove MS Word specific meta tags
        // but keep all styles, colors, fonts, and formatting intact
        if (args.content) {
          // Remove only MS Word specific meta tags and XML namespaces
          args.content = args.content.replace(/<meta[^>]*>/gi, "");
          args.content = args.content.replace(
            /xmlns:o="urn:schemas-microsoft-com[^"]*"/gi,
            "",
          );
          args.content = args.content.replace(
            /xmlns:w="urn:schemas-microsoft-com[^"]*"/gi,
            "",
          );
          args.content = args.content.replace(
            /xmlns:m="urn:schemas-microsoft-com[^"]*"/gi,
            "",
          );

          // Preserve Word list markers and bullets
          // Convert Word's special list markers to proper HTML lists
          args.content = args.content.replace(
            /<p[^>]*class=["'][^"']*MsoListParagraph[^"']*["'][^>]*>/gi,
            "<li>",
          );
          args.content = args.content.replace(
            /<p[^>]*style=["'][^"']*mso-list[^"']*["'][^>]*>/gi,
            "<li>",
          );

          // Keep all inline styles and formatting including list indentation
          args.content = args.content.replace(
            /<span style=["']mso-spacerun:yes["'][^>]*>/gi,
            "<span>",
          );
        }
      },
      paste_postprocess: (plugin, args) => {
        // Images are now handled in the setup paste event handler
        // This just cleans up any remaining file:// URLs that might slip through
        const images = args.node.querySelectorAll("img");

        for (const img of images) {
          const src = img.getAttribute("src");

          // Remove or mark images with file:// protocol that weren't caught by clipboard handler
          if (src && src.startsWith("file://")) {
            // Set a temporary data attribute so the paste handler can identify it
            img.setAttribute("data-needs-upload", "true");
          }
        }
      },
      selector: "textarea",
      min_height: typeof height === "string" ? parseInt(height) : height,
      image_caption: true,
      quickbars_selection_toolbar:
        "bold italic | quicklink h2 h3 blockquote quickimage quicktable",
      noneditable_class: "mceNonEditable",
      toolbar_mode: "sliding",
      contextmenu: false,
      // skin: useDarkMode ? "oxide-dark" : "oxide",
      content_css: "default",
      content_style:
        "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
      setup: (editor) => {
        editor.on("init", () => {
          try {
            const dialogContainer =
              document.querySelector('[role="dialog"]') ||
              document.getElementById("dialog-form");

            if (dialogContainer) {
              const auxElements = document.querySelectorAll(
                "body > .tox-tinymce-aux, body > .tox.tox-silver-sink.tox-tinymce-aux",
              );

              auxElements.forEach((el) => {
                // Only append if not already inside this dialog
                if (!dialogContainer.contains(el)) {
                  dialogContainer.appendChild(el);
                }
              });
            }
          } catch (err) {
            console.error("TinyMCE dialog relocate error:", err);
          }
        });

        // Handle paste events to capture images from clipboard
        editor.on("paste", (e) => {
          const clipboardData = e.clipboardData || window.clipboardData;

          if (clipboardData && clipboardData.items) {
            const items = clipboardData.items;
            const imageBlobs = [];
            let hasHtml = false;

            // Collect all images from clipboard
            for (let i = 0; i < items.length; i++) {
              const item = items[i];

              if (item.type.indexOf("text/html") !== -1) {
                hasHtml = true;
              }

              if (item.type.indexOf("image") !== -1) {
                const blob = item.getAsFile();
                if (blob) {
                  imageBlobs.push(blob);
                }
              }
            }

            // If we have images, handle them
            if (imageBlobs.length > 0) {
              // If there's HTML content too (mixed paste), let it paste first
              // then we'll process and upload the images
              if (hasHtml) {
                // Don't prevent default - let HTML paste through
                // Then find and upload images after a short delay
                setTimeout(() => {
                  // Find all images that need to be replaced (data:, file://, or blob:)
                  const contentImages = editor
                    .getBody()
                    .querySelectorAll(
                      'img[src^="data:"], img[src^="file://"], img[src^="blob:"]',
                    );

                  // Upload each image blob
                  imageBlobs.forEach((blob, index) => {
                    const reader = new FileReader();
                    reader.onload = (readerEvent) => {
                      const base64 = readerEvent.target.result;

                      // Find the corresponding image in the editor
                      const img = contentImages[index];
                      if (img) {
                        // Temporarily set to base64
                        img.src = base64;
                        img.removeAttribute("data-mce-src");

                        // Upload the image
                        const formData = new FormData();
                        formData.append(
                          "image",
                          blob,
                          `pasted-image-${Date.now()}-${index}.png`,
                        );

                        const xhr = new XMLHttpRequest();
                        xhr.withCredentials = false;
                        xhr.open(
                          "POST",
                          `${import.meta.env.VITE_API_URL}/common/image`,
                        );

                        xhr.onload = () => {
                          if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                              const json = JSON.parse(xhr.responseText);
                              if (json && json.url) {
                                // Replace the image src with uploaded URL
                                img.src = json.url;
                                img.removeAttribute("data-mce-src");
                              }
                            } catch (err) {
                              console.error(
                                "Failed to parse upload response",
                                err,
                              );
                            }
                          }
                        };

                        xhr.send(formData);
                      }
                    };

                    reader.readAsDataURL(blob);
                  });
                }, 150); // Slightly longer delay to ensure paste is complete
              } else {
                // Only images, no HTML - handle as before
                e.preventDefault();

                imageBlobs.forEach((blob, index) => {
                  const reader = new FileReader();
                  reader.onload = (readerEvent) => {
                    const base64 = readerEvent.target.result;

                    // Insert the image with base64 temporarily
                    editor.insertContent(
                      `<img src="${base64}" alt="Uploaded image" />`,
                    );

                    // Now upload it to replace with permanent URL
                    const formData = new FormData();
                    formData.append(
                      "image",
                      blob,
                      `pasted-image-${Date.now()}-${index}.png`,
                    );

                    const xhr = new XMLHttpRequest();
                    xhr.withCredentials = false;
                    xhr.open(
                      "POST",
                      `${import.meta.env.VITE_API_URL}/common/image`,
                    );

                    xhr.onload = () => {
                      if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                          const json = JSON.parse(xhr.responseText);
                          if (json && json.url) {
                            // Replace base64 with uploaded URL
                            const content = editor.getContent();
                            const updatedContent = content.replace(
                              base64,
                              json.url,
                            );
                            editor.setContent(updatedContent);
                          }
                        } catch (err) {
                          console.error("Failed to parse upload response", err);
                        }
                      }
                    };

                    xhr.send(formData);
                  };

                  reader.readAsDataURL(blob);
                });
              }
            }
          }
        });

        // Customize image dialog to hide source URL field and show only upload
        editor.on("OpenDialog", (e) => {
          if (
            e.dialog &&
            e.dialog.settings &&
            e.dialog.settings.title === "Insert/Edit Image"
          ) {
            setTimeout(() => {
              try {
                const dialog = e.dialog;
                const sourceInput = dialog.find("#src")[0];
                if (sourceInput) {
                  sourceInput.style.display = "none";
                  const parent = sourceInput.parentElement;
                  if (parent) {
                    parent.style.display = "none";
                  }
                }
                const labels = dialog.getBody().querySelectorAll("label");
                labels.forEach((label) => {
                  if (
                    label.textContent &&
                    label.textContent.toLowerCase().includes("source")
                  ) {
                    label.style.display = "none";
                    const input =
                      label.nextElementSibling ||
                      label.parentElement?.querySelector("input");
                    if (input) {
                      input.style.display = "none";
                    }
                  }
                });
              } catch (err) {
                // Silent fail
              }
            }, 200);
          }
        });
      },
      ...initOverrides,
    }),
    [height, initOverrides],
  );

  const effectiveApiKey =
    import.meta.env.VITE_TINYMCE_API_KEY ||
    "mrjzg34xdadqgcqxfqjm0c1ymp23fumthj7ds61a4vlmvlrn";

  const handleEditorChange = (content, editor) => {
    // Always normalize content to empty string if null/undefined
    const normalizedContent = content ?? "";

    // Call the appropriate onChange handler (onChangeContent or onChange)
    if (actualOnChange) {
      actualOnChange(normalizedContent);
    }

    // Also call onEditorChange if provided (for advanced use cases)
    if (onEditorChange) {
      onEditorChange(normalizedContent, editor);
    }
  };

  // Detect whether the browser exposes the async clipboard read API
  // (many browsers restrict programmatic paste; if not available we'll show a helpful hint)
  const clipboardSupported =
    typeof navigator !== "undefined" &&
    !!(
      navigator.clipboard &&
      (navigator.clipboard.read || navigator.clipboard.readText)
    );

  return (
    <>
      {!clipboardSupported && (
        <div
          style={{
            marginBottom: 8,
            fontSize: 13,
            color: "#6b7280",
          }}
          aria-live="polite"
        >
          Your browser doesn't support direct access to the clipboard. Please
          use the
          <span style={{ fontWeight: 600 }}> ⌘+X / ⌘+C / ⌘+V</span> keyboard
          shortcuts instead.
        </div>
      )}
      <Editor
        apiKey={effectiveApiKey}
        value={isControlled ? normalizedValue : undefined}
        initialValue={isControlled ? undefined : normalizedDefaultValue}
        init={tinymceInit}
        disabled={disabled}
        onInit={onInit}
        onBlur={onBlur}
        onEditorChange={handleEditorChange}
      />
    </>
  );
}
