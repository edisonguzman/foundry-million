"use client";

import { useState, useEffect } from "react";

export default function ProtectedEmail() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    // We break the email into parts so the full string NEVER exists in the source code
    const user = "support";
    const domain = "howtoattractcustomers";
    const extension = "com";
    
    // Assemble it only after the component mounts in the browser
    setEmail(`${user}@${domain}.${extension}`);
  }, []);

  // Show a fallback while JavaScript is loading (or if a bot is looking)
  if (!email) {
    return <span className="text-gray-600 select-none">Contacting secure server...</span>;
  }

  return (
    <a 
      href={`mailto:${email}`} 
      className="text-gray-500 hover:text-white transition-colors lowercase"
    >
      {email}
    </a>
  );
}