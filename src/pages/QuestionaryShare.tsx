import { Link, useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { useEffect, useState } from "react";
import { Spinner } from "../components/visuals/Spinner";

export default function ShareQuestionary() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setTimeout(() => {
      setUrl(`${window.location.origin}/questionary/view/${id}`);
      setLoading(false);
    }, 500);
  }, [id]);

  return (
    <div className="flex flex-col items-center justify-start p-4 sm:p-6 md:p-8 lg:p-8 
    border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 min-h-[500px]">
      {loading ? (
        <Spinner />
      ) : (
        <>
          <h1 className="text-2xl font-semibold mb-6">
            Escanea para abrir el cuestionario
          </h1>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <QRCodeCanvas
              value={url}
              size={250}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
            />
          </div>
          <Link to={url}>
            <p
              className="
              mt-6 text-blue-600 text-sm break-all text-center
              hover:underline cursor-pointer hover:text-blue-800
              transition-colors
            "
            >
              {url}
            </p>
          </Link>
        </>
      )}
    </div>
  );
}