import type { EtapePassation } from '@/simadou/allTypes/etapePassation'

const MS_PER_DAY = 1000 * 60 * 60 * 24

export type EtapeCalcul = {
    dureePrevue: number | null
    dureeRealisee: number | null
    ecart: number | null
}

export type DureeGlobale = {
    dureePrevue: number | null
    dureeConsommee: number | null
    ecart: number | null
    premiereDatePrevue: string | null
    derniereDatePrevue: string | null
    premiereDateRealisee: string | null
    derniereDateRealisee: string | null
    derniereEtapeRealisee: boolean
}

/**
 * Parse une date YYYY-MM-DD sans subir les décalages UTC.
 */
export function parseDateOnly(value?: string | null): Date | null {
    if (!value) return null

    const valueOnly = value.slice(0, 10)
    const parts = valueOnly.split('-')

    if (parts.length !== 3) return null

    const [year, month, day] = parts.map(Number)

    if (
        !Number.isFinite(year) ||
        !Number.isFinite(month) ||
        !Number.isFinite(day)
    ) {
        return null
    }

    const date = new Date(year, month - 1, day)

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null
    }

    return date
}

/**
 * Retourne le nombre de jours entre deux dates.
 */
export function diffDays(
    start?: string | null,
    end?: string | null
): number | null {
    const startDate = parseDateOnly(start)
    const endDate = parseDateOnly(end)

    if (!startDate || !endDate) return null

    return Math.round(
        (endDate.getTime() - startDate.getTime()) / MS_PER_DAY
    )
}

/**
 * Retourne la date du jour au format YYYY-MM-DD.
 */
export function getTodayDate(): string {
    const today = new Date()

    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

/**
 * Calcule les durées d'une étape par rapport à l'étape précédente.
 */
export function calculateEtapeDuration(
    current: EtapePassation,
    previous?: EtapePassation
): EtapeCalcul {
    if (!previous) {
        return {
            dureePrevue: null,
            dureeRealisee: null,
            ecart: null,
        }
    }

    const dureePrevue = diffDays(
        previous.date_prevu,
        current.date_prevu
    )

    const dureeRealisee =
        previous.date_realise && current.date_realise
            ? diffDays(
                previous.date_realise,
                current.date_realise
            )
            : null

    const ecart =
        dureePrevue !== null && dureeRealisee !== null
            ? dureeRealisee - dureePrevue
            : null

    return {
        dureePrevue,
        dureeRealisee,
        ecart,
    }
}

/**
 * Calcule les durées globales du PPM.
 *
 * Durée prévue :
 * dernière date prévue - première date prévue
 *
 * Durée consommée :
 * première date réalisée -> aujourd'hui
 * tant que la dernière étape n'est pas réalisée.
 *
 * Lorsque la dernière étape est réalisée :
 * première date réalisée -> dernière date réalisée.
 */
export function calculateGlobalDurations(
    etapes: EtapePassation[]
): DureeGlobale {
    if (!etapes.length) {
        return {
            dureePrevue: null,
            dureeConsommee: null,
            ecart: null,
            premiereDatePrevue: null,
            derniereDatePrevue: null,
            premiereDateRealisee: null,
            derniereDateRealisee: null,
            derniereEtapeRealisee: false,
        }
    }

    const premiereEtape = etapes[0]
    const derniereEtape = etapes[etapes.length - 1]

    const premiereDatePrevue = premiereEtape?.date_prevu ?? null
    const derniereDatePrevue = derniereEtape?.date_prevu ?? null

    const dureePrevue = diffDays(
        premiereDatePrevue,
        derniereDatePrevue
    )

    const etapesRealisees = etapes.filter(
        (etape) => Boolean(etape.date_realise)
    )

    const premiereEtapeRealisee = etapesRealisees[0] ?? null

    const premiereDateRealisee =
        premiereEtapeRealisee?.date_realise ?? null

    const derniereDateRealisee =
        derniereEtape?.date_realise ?? null

    const derniereEtapeRealisee = Boolean(
        derniereEtape?.date_realise
    )

    let dureeConsommee: number | null = null

    if (premiereDateRealisee) {
        const dateFin = derniereEtapeRealisee
            ? derniereDateRealisee
            : getTodayDate()

        dureeConsommee = diffDays(
            premiereDateRealisee,
            dateFin
        )
    }

    const ecart =
        dureePrevue !== null && dureeConsommee !== null
            ? dureeConsommee - dureePrevue
            : null

    return {
        dureePrevue,
        dureeConsommee,
        ecart,
        premiereDatePrevue,
        derniereDatePrevue,
        premiereDateRealisee,
        derniereDateRealisee,
        derniereEtapeRealisee,
    }
}

/**
 * Calcule les durées de toutes les étapes.
 */
export function calculateEtapesDurations(
    etapes: EtapePassation[]
): Map<number, EtapeCalcul> {
    const result = new Map<number, EtapeCalcul>()

    etapes.forEach((etape, index) => {
        const previous = index > 0 ? etapes[index - 1] : undefined

        result.set(
            etape.id_etape,
            calculateEtapeDuration(etape, previous)
        )
    })

    return result
}