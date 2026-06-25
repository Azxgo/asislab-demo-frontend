export interface Cuestionario {
    _id: string;
    nombre: string;
    area_id?: string;
    area_nombre: string;
    prom_puntaje: string;
    prom_porcentaje: string;
    estado: string;
}

export interface Alternativa {
    opcion: string;
    texto: string;
    correcta: boolean;
    contador: number;
}

export interface Pregunta {
    id: string
    pregunta: string;
    alternativas: Alternativa[];
}

export interface Modulo {
    modulo?: string;
    preguntas: Pregunta[];
    visible_questions?: number
}

export interface Talk {
    modulo: number
    nombre: string
    text: string
}

interface NormalQuestionary {
    tipo: "normal";
    preguntas: Pregunta[];
}

interface ModuloQuestionary {
    tipo: "modulo";
    modulos: Modulo[];
}

export type QuestionData = NormalQuestionary | ModuloQuestionary;

