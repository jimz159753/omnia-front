import React from "react";

const PrivacyPolicy = () => {
  return (
    <div
      style={{
        backgroundColor: "#1a1a1a",
        color: "#ffffff",
        minHeight: "100vh",
        padding: "120px 2rem 4rem",
        fontFamily: "var(--font-cabinet-grotesk)",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-lora-regular)",
            fontSize: "3rem",
            marginBottom: "2rem",
            textAlign: "center",
            background: "linear-gradient(to right, #ffffff, #a0a0a0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Política de Privacidad
        </h1>

        <div
          style={{
            lineHeight: "1.8",
            fontSize: "1.1rem",
            color: "#cccccc",
          }}
        >
          <p style={{ marginBottom: "1.5rem" }}>
            En <strong>Espacio Omnia</strong>, la privacidad de nuestros
            visitantes es de suma importancia. Este documento de política de
            privacidad describe los tipos de información personal que se reciben
            y recopilan y cómo se utilizan.
          </p>

          <h2
            style={{
              fontFamily: "var(--font-lora-regular)",
              fontSize: "1.8rem",
              marginTop: "2.5rem",
              marginBottom: "1rem",
              color: "#ffffff",
            }}
          >
            1. Recopilación de Información
          </h2>
          <p style={{ marginBottom: "1.5rem" }}>
            Recopilamos información cuando te registras en nuestro sitio, realizas una
            reserva o te comunicas con nosotros a través de WhatsApp. La información recopilada
            incluye tu nombre, dirección de correo electrónico, número de teléfono y detalles de la cita.
          </p>

          <h2
            style={{
              fontFamily: "var(--font-lora-regular)",
              fontSize: "1.8rem",
              marginTop: "2.5rem",
              marginBottom: "1rem",
              color: "#ffffff",
            }}
          >
            2. Uso de la Información
          </h2>
          <p style={{ marginBottom: "1.5rem" }}>
            Cualquiera de la información que recopilamos de usted puede usarse de una de las siguientes maneras:
          </p>
          <ul style={{ paddingLeft: "1.5rem", marginBottom: "1.5rem" }}>
            <li>Para personalizar tu experiencia y responder mejor a tus necesidades individuales.</li>
            <li>Para mejorar nuestro sitio web basándonos en la información y los comentarios que recibimos de ti.</li>
            <li>Para mejorar el servicio al cliente y tus necesidades de soporte.</li>
            <li>Para procesar transacciones y gestionar tus reservas.</li>
            <li>Para enviar correos electrónicos periódicos o mensajes de WhatsApp relacionados con tu servicio.</li>
          </ul>

          <h2
            style={{
              fontFamily: "var(--font-lora-regular)",
              fontSize: "1.8rem",
              marginTop: "2.5rem",
              marginBottom: "1rem",
              color: "#ffffff",
            }}
          >
            3. Protección de la Información
          </h2>
          <p style={{ marginBottom: "1.5rem" }}>
            Implementamos una variedad de medidas de seguridad para mantener la seguridad de tu información personal. Utilizamos tecnologías de cifrado avanzadas para proteger los datos transmitidos en línea.
          </p>

          <h2
            style={{
              fontFamily: "var(--font-lora-regular)",
              fontSize: "1.8rem",
              marginTop: "2.5rem",
              marginBottom: "1rem",
              color: "#ffffff",
            }}
          >
            4. Divulgación a Terceros
          </h2>
          <p style={{ marginBottom: "1.5rem" }}>
            No vendemos, intercambiamos ni transferimos a terceros tus datos personales identificables. Esto no incluye a terceros de confianza que nos asisten en la operación de nuestro sitio web o en la prestación de servicios, siempre que dichas partes acuerden mantener esta información confidencial.
          </p>

          <h2
            style={{
              fontFamily: "var(--font-lora-regular)",
              fontSize: "1.8rem",
              marginTop: "2.5rem",
              marginBottom: "1rem",
              color: "#ffffff",
            }}
          >
            5. Consentimiento
          </h2>
          <p style={{ marginBottom: "1.5rem" }}>
            Al utilizar nuestro sitio, aceptas nuestra política de privacidad.
          </p>

          <p style={{ marginTop: "3rem", fontSize: "0.9rem", color: "#888888" }}>
            Última actualización: {new Date().toLocaleDateString("es-MX", { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
