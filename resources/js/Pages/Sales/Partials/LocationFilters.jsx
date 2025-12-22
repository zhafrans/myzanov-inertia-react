import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import axios from "axios";

export default function LocationFilters({ filters, setFilters }) {
    const [provinces, setProvinces] = useState([]);
    const [cities, setCities] = useState([]);
    const [subdistricts, setSubdistricts] = useState([]);
    const [villages, setVillages] = useState([]);

    // Fetch Provinces on mount
    useEffect(() => {
        const fetchProvinces = async () => {
            try {
                const res = await axios.get(route("locations.provinces"));
                setProvinces(res.data);

                // Set default province to JAWA TENGAH if not set
                if (!filters.province_id) {
                    const jawaTengah = res.data.find(
                        (p) => p.name?.toUpperCase() === "JAWA TENGAH"
                    );
                    if (jawaTengah) {
                        setFilters((prev) => ({
                            ...prev,
                            province_id: jawaTengah.id.toString(),
                        }));
                    }
                }
            } catch (error) {
                console.error("Error fetching provinces:", error);
            }
        };
        fetchProvinces();
    }, []);

    // Fetch Cities when province changes
    useEffect(() => {
        if (filters.province_id) {
            axios
                .get(route("locations.cities", filters.province_id))
                .then((res) => setCities(res.data))
                .catch((err) => console.error(err));
        } else {
            setCities([]);
        }
    }, [filters.province_id]);

    // Fetch Subdistricts when city changes
    useEffect(() => {
        if (filters.city_id) {
            axios
                .get(route("locations.subdistricts", filters.city_id))
                .then((res) => setSubdistricts(res.data))
                .catch((err) => console.error(err));
        } else {
            setSubdistricts([]);
        }
    }, [filters.city_id]);

    // Fetch Villages when subdistrict changes
    useEffect(() => {
        if (filters.subdistrict_id) {
            axios
                .get(route("locations.villages", filters.subdistrict_id))
                .then((res) => setVillages(res.data))
                .catch((err) => console.error(err));
        } else {
            setVillages([]);
        }
    }, [filters.subdistrict_id]);

    const handleLocationChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };

        // Reset lower levels
        if (field === "province_id") {
            newFilters.city_id = "";
            newFilters.subdistrict_id = "";
            newFilters.village_id = "";
        } else if (field === "city_id") {
            newFilters.subdistrict_id = "";
            newFilters.village_id = "";
        } else if (field === "subdistrict_id") {
            newFilters.village_id = "";
        }

        setFilters(newFilters);
    };

    return (
        <div className="space-y-4 border-t pt-4">
            <p className="text-sm font-semibold">Filter Wilayah</p>
            
            {/* Province */}
            <div className="space-y-2">
                <Label>Provinsi</Label>
                <SearchableSelect
                    value={filters.province_id}
                    onValueChange={(v) =>
                        handleLocationChange("province_id", v)
                    }
                    options={provinces}
                    placeholder="Pilih provinsi..."
                    searchPlaceholder="Cari provinsi..."
                    emptyText="Provinsi tidak ditemukan"
                />
            </div>

            {/* City */}
            <div className="space-y-2">
                <Label>Kota/Kab</Label>
                <SearchableSelect
                    value={filters.city_id}
                    onValueChange={(v) => handleLocationChange("city_id", v)}
                    options={cities}
                    placeholder="Pilih kota/kabupaten..."
                    searchPlaceholder="Cari kota/kabupaten..."
                    emptyText="Kota/Kabupaten tidak ditemukan"
                    disabled={!filters.province_id}
                />
            </div>

            {/* Subdistrict */}
            <div className="space-y-2">
                <Label>Kecamatan</Label>
                <SearchableSelect
                    value={filters.subdistrict_id}
                    onValueChange={(v) =>
                        handleLocationChange("subdistrict_id", v)
                    }
                    options={subdistricts}
                    placeholder="Pilih kecamatan..."
                    searchPlaceholder="Cari kecamatan..."
                    emptyText="Kecamatan tidak ditemukan"
                    disabled={!filters.city_id}
                />
            </div>

            {/* Village */}
            <div className="space-y-2">
                <Label>Desa/Kelurahan</Label>
                <SearchableSelect
                    value={filters.village_id}
                    onValueChange={(v) =>
                        handleLocationChange("village_id", v)
                    }
                    options={villages}
                    placeholder="Pilih desa/kelurahan..."
                    searchPlaceholder="Cari desa/kelurahan..."
                    emptyText="Desa/Kelurahan tidak ditemukan"
                    disabled={!filters.subdistrict_id}
                />
            </div>
        </div>
    );
}
