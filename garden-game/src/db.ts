import Dexie, { type Table } from 'dexie'

export type Bed = {
	id?: number
	name: string
	areaSqM?: number
	notes?: string
}

export type Seed = {
	id?: number
	cropName: string
	variety?: string
	vendor?: string
	lot?: string
	sowBy?: string
	notes?: string
}

export type Planting = {
	id?: number
	bedId: number
	seedId: number
	plantedAt: string
	count?: number
	notes?: string
}

export type Treatment = {
	id?: number
	plantingId?: number
	bedId?: number
	type: string
	performedAt: string
	notes?: string
}

export type Harvest = {
	id?: number
	plantingId?: number
	harvestedAt: string
	amount?: number
	unit?: string
	notes?: string
}

class GardenDB extends Dexie {
	beds!: Table<Bed, number>
	seeds!: Table<Seed, number>
	plantings!: Table<Planting, number>
	treatments!: Table<Treatment, number>
	harvests!: Table<Harvest, number>

	constructor() {
		super('gardenDB')
		this.version(1).stores({
			beds: '++id, name',
			seeds: '++id, cropName, variety',
			plantings: '++id, bedId, seedId, plantedAt',
			treatments: '++id, plantingId, bedId, performedAt',
			harvests: '++id, plantingId, harvestedAt'
		})
	}
}

export const db = new GardenDB()