import React from "react";

const TermsOfService = () => {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        color: "#1a1a1a",
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
            background: "linear-gradient(to right, #000000, #444444)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Términos de Servicio
        </h1>

        <div
          style={{
            lineHeight: "1.8",
            fontSize: "1.1rem",
            color: "#444444",
          }}
        >
          <p style={{ marginBottom: "1.5rem" }}>
            Bienvenido a <strong>Espacio Omnia</strong>. Al acceder y utilizar este sitio web, usted acepta cumplir con los siguientes términos y condiciones de uso.
          </p>

          <h2
            style={{
              fontFamily: "var(--font-lora-regular)",
              fontSize: "1.8rem",
              marginTop: "2.5rem",
              marginBottom: "1rem",
              color: "#000000",
            }}
          >
            1. Uso del Sitio
          </h2>
          <p style={{ marginBottom: "1.5rem" }}>
            El contenido de las páginas de este sitio web es para su información general y uso exclusivo. Está sujeto a cambios sin previo aviso. El uso de cualquier información o material en este sitio web es bajo su propio riesgo, por lo cual no seremos responsables.
          </p>

          <h2
            style={{
              fontFamily: "var(--font-lora-regular)",
              fontSize: "1.8rem",
              marginTop: "2.5rem",
              marginBottom: "1rem",
              color: "#000000",
            }}
          >
            2. Reservas y Cancelaciones
          </h2>
          <p style={{ marginBottom: "1.5rem" }}>
            Las reservas realizadas a través de nuestro sistema están sujetas a disponibilidad. Nos reservamos el derecho de cancelar o reprogramar citas en caso de necesidad, notificando al usuario con la mayor antelación posible.
          </p>
          <p style={{ marginBottom: "1.5rem" }}>
            Los usuarios deben cancelar o reprogramar sus citas con al menos 24 horas de antelación. Las cancelaciones tardías pueden estar sujetas a cargos adicionales o a la pérdida del depósito si aplica.
          </p>

          <h2
            style={{
              fontFamily: "var(--font-lora-regular)",
              fontSize: "1.8rem",
              marginTop: "2.5rem",
              marginBottom: "1rem",
              color: "#000000",
            }}
          >
            3. Propiedad Intelectual
          </h2>
          <p style={{ marginBottom: "1.5rem" }}>
            Este sitio web contiene material que es propiedad nuestra o está licenciado a nosotros. Este material incluye, pero no se limita a, el diseño, la disposición, el aspecto, la apariencia y los gráficos. La reproducción está prohibida salvo de conformidad con el aviso de copyright.
          </p>

          <h2
            style={{
              fontFamily: "var(--font-lora-regular)",
              fontSize: "1.8rem",
              marginTop: "2.5rem",
              marginBottom: "1rem",
              color: "#000000",
            }}
          >
            4. Limitación de Responsabilidad
          </h2>
          <p style={{ marginBottom: "1.5rem" }}>
            Espacio Omnia no será responsable de ningún daño indirecto, incidental o consecuente que surja del uso de nuestros servicios o de la imposibilidad de utilizar el sitio web.
          </p>

          <h2
            style={{
              fontFamily: "var(--font-lora-regular)",
              fontSize: "1.8rem",
              marginTop: "2.5rem",
              marginBottom: "1rem",
              color: "#000000",
            }}
          >
            5. Ley Aplicable
          </h2>
          <p style={{ marginBottom: "1.5rem" }}>
            El uso de este sitio web y cualquier disputa que surja de dicho uso están sujetos a las leyes de México.
          </p>

          <p style={{ marginTop: "3rem", fontSize: "0.9rem", color: "#666666" }}>
            Última actualización: {new Date().toLocaleDateString("es-MX", { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>

  );
};

export default TermsOfService;
