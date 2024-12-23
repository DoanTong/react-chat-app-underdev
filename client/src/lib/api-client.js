import axios from "axios";
import {HOST} from "@/ultis/constants"

export const apiClient = axios.create({
    baseURL: HOST,
});