import { useEffect } from "react";

const Buzzlead = () => {
    useEffect(() =>{
        setTimeout(() => {
          const script = document.createElement("script");
          script.type = "text/javascript";
          script.src = `https://static.buzzlead.com.br/tracker.js`;
          document.body.appendChild(script);
        }, 100);
    }, []);
    return null;
}

export default Buzzlead
