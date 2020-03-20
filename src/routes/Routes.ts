import Express from "express";
import Index from "./Index";
import FeedContent from "./FeedContent";

export default function initRoutes(exp : Express.Application, expressURL : string, systemLocale : string) {
        Index(exp, expressURL);
        FeedContent(exp, expressURL, systemLocale);
}