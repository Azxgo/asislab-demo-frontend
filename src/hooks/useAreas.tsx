
import { useEffect, useState } from "react";
import type { Area } from "../types/area";
import apiClient from "../config/apiClient";

export function useAreas() {
    const [areas, setAreas] = useState<Area[]>([])

    const fetchAreas = async () => {
        try {
            const res = await apiClient.get("/areas/getAll");
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