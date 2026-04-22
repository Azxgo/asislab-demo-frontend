import axios from "axios";
import { useEffect, useState } from "react";
import type { Area } from "../types/area";

export function useAreas() {
    const [areas, setAreas] = useState<Area[]>([])

    const fetchAreas = async () => {
        try {
            const res = await axios.get("http://localhost:5000/areas/getAll");
            setAreas(res.data.areas || []);
        } catch (err) {
            console.error("Error al obtener áreas:", err);
        }
    };

    useEffect(() => {
        fetchAreas()
    }, [])

    return { areas, setAreas }
}