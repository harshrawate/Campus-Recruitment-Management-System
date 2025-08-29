const axios = require("axios");
const templates = require("../constants/whatsappTemplate");

exports.sendVerificationCode = async (phoneNumber, otp) => {
  const formattedNumber = phoneNumber.startsWith("+")
    ? phoneNumber.substring(1)
    : phoneNumber;

  console.log("Sending OTP to:", formattedNumber);

  try {
    const response = await axios({
      url: "https://graph.facebook.com/v22.0/546550445212498/messages",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        to: formattedNumber,
        type: "template",
        template: {
          name: "otp_message",
          language: {
            code: "en",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: otp,
                },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [
                {
                  type: "text",
                  text: otp,
                },
              ],
            },
          ],
        },
      },
    });

    console.log("WhatsApp API Response:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("WhatsApp API Error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else {
      console.error("Error sending OTP:", error.message);
    }
    throw error;
  }
};

exports.sendProfileUpdateReminder = async (phoneNumber, customerName) => {
  const formattedNumber = phoneNumber.startsWith("+")
    ? phoneNumber.substring(1)
    : phoneNumber;

  console.log("Sending profile update reminder to:", formattedNumber);

  try {
    const response = await axios({
      url: "https://graph.facebook.com/v22.0/546550445212498/messages",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        to: formattedNumber,
        type: "template",
        template: {
          name: "profile_update",
          language: {
            code: "en",
          },
          components: [
            {
              type: "body",
              parameters: [
                {
                  type: "text",
                  text: customerName,
                },
                {
                  type: "text",
                  text: `${process.env.CLIENT_URL}/student/update-profile`,
                },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [
                {
                  type: "text",
                  text: `${process.env.CLIENT_URL}/student/update-profile`,
                },
              ],
            },
          ],
        },
      },
    });

    console.log("WhatsApp API Response:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error("WhatsApp API Error:", {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
      });
    } else {
      console.error("Error sending profile update reminder:", error.message);
    }
    throw error;
  }
};

const findTemplateById = (templateId) => {
  const allTemplates = [
    ...templates.job,
    ...templates.reminder,
    ...templates.form,
  ];
  return allTemplates.find((tpl) => tpl.id.trim() === templateId.trim());
};

// Format parameters for a component
const formatComponent = (componentType, variables, mapping = []) => {
  if (!mapping || mapping.length === 0) return [];

  return [
    {
      type: componentType,
      parameters: mapping.map((key) => ({
        type: "text",
        text: variables[key] || "",
      })),
    },
  ];
};

// Send a WhatsApp message
const sendMessage = async (phoneNumber, template, variables) => {
  const formattedNumber = phoneNumber.startsWith("+")
    ? phoneNumber.substring(1)
    : phoneNumber;

  const bodyVars = template.variableMapping?.body || [];
  const headerVars = template.variableMapping?.header || [];
  const buttonVars = template.variableMapping?.button || [];

  const components = [];

  // Header component
  if (headerVars.length > 0 && template.header) {
    components.push({
      type: "header",
      parameters: headerVars.map((_, index) => {
        // Use index+1 to match the '1', '2', etc. keys
        const key = (index + 1).toString();
        return {
          type: "text",
          text: variables.header?.[key] || "",
        };
      }),
    });
  }

  // Body component
  if (bodyVars.length > 0) {
    components.push({
      type: "body",
      parameters: bodyVars.map((_, index) => {
        // Use index+1 to match the '1', '2', etc. keys
        const key = (index + 1).toString();
        return {
          type: "text",
          text: variables.body?.[key] || "",
        };
      }),
    });
  }

  // Button component (if needed)
  if (buttonVars && buttonVars.length > 0) {
    buttonVars.forEach((_, index) => {
      // Use index+1 to match the '1', '2', etc. keys
      const key = (index + 1).toString();
      components.push({
        type: "button",
        sub_type: "url",
        index,
        parameters: [
          {
            type: "text",
            text: variables.button?.[key] || "",
          },
        ],
      });
    });
  }

  // Make sure we have a valid template name
  const templateName = template.id.trim();

  try {
    const response = await axios({
      url: "https://graph.facebook.com/v17.0/546550445212498/messages",
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      data: {
        messaging_product: "whatsapp",
        to: formattedNumber,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "en",
          },
          components: components,
        },
      },
    });

    console.log(`✅ Sent to ${formattedNumber}`, response.data);
    return response.data;
  } catch (error) {
    console.error(
      `❌ Failed for ${formattedNumber}`,
      error?.response?.data || error.message
    );
    throw error;
  }
};

exports.sendBulkWhatsappMessages = async (
  mobileNumbers,
  templateId,
  variables,
  notificationType
) => {
  const template = findTemplateById(templateId);
  if (!template) {
    throw new Error("Invalid templateId");
  }

  const responses = [];
  for (const phone of mobileNumbers) {
    const response = await sendMessage(phone, template, variables);
    responses.push(response);
  }

  return responses;
};
