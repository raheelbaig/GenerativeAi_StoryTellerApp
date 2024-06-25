"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Frame } from "@gptscript-ai/gptscript";

const storiesPath = "public/stories";

function StoryWriter() {
  const [story, setStory] = useState<string>("");
  const [pages, setPages] = useState<number>();
  const [progress, setProgress] = useState<number>();
  const [runStarted, setRunStarted] = useState<boolean>(false);
  const [runFinished, setRunFinished] = useState<boolean | null>(null);
  const [currentTool, setCurrentTool] = useState("");
  const [events, setEvents] = useState<Frame[]>([]);

  async function runScript() {
    setRunStarted(true);
    setRunFinished(false);

    const response = await fetch("/api/run-script", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ story, pages, path: storiesPath }),
    });

    if (response.ok && response.body) {
      // Handle stream from api
      // ...
      console.log("Streaming Started");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      handleStream(reader, decoder);
    } else {
      setRunFinished(true);
      setRunStarted(false);
      console.error("Failed to start Streaming.");
    }
  }

  async function handleStream(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    decoder: TextDecoder
  ) {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break; //Breaks out of the infinite loop!

      //   Explaination: The decoder is docode the Uint8Array into string
      const chunk = decoder.decode(value, { stream: true });

      // Explanation: We split the chunk into events by splitting it by the event: keyword.
      const eventData = chunk
        .split("\n\n")
        .filter((line) => line.startsWith("event: "))
        .map((line) => line.replace(/^event: /, ""));

      //   Explanation: We parse the JSON data and update the state accordingly
      eventData.forEach((data) => {
        try {
          const parseData = JSON.parse(data);
          if (parseData.type === "callProgress") {
            setProgress(parseData.output[parseData.output.length - 1].content);
            setCurrentTool(parseData.tool?.description || "");
          } else if (parseData.type === "CallStart") {
            setCurrentTool(parseData.tool.description || "");
          } else if (parseData.type === "runFinished") {
            setRunFinished(true);
            setRunStarted(false);
          } else {
            setEvents((prevEvents) => [...prevEvents, parseData]);
          }
        } catch (error) {}
      });
    }
  }

  return (
    <div className="flex flex-col container">
      <section className="flex-1 flex flex-col border border-purple-300 rounded-md p-10 space-y-2">
        <Textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          className="flex-1 text-black"
          placeholder="Write a story about a robot and a human who become friends..."
        />
        <Select onValueChange={(value) => setPages(parseInt(value))}>
          <SelectTrigger>
            <SelectValue
              placeholder="How many pages should the story be ?
                    "
            />
          </SelectTrigger>

          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => (
              <SelectItem key={i} value={String(i + 1)}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={runScript}
          disabled={!story || !pages}
          className="w-full bg-purple-700 hover:bg-purple-900"
          size="lg"
        >
          Generate Story
        </Button>
      </section>

      <section className="flex-1 pb-5 mt-5">
        <div className="flex flex-col-reverse w-full space-y-2 bg-gray-800 rounded-lg text-gray-200 font-mono p-10 h-96 overflow-y-auto">
          <div>
            {runFinished === null && (
              <>
                <p className="animate-pulse mr-3">
                  Im waiting for you to Generate a story above...
                </p>
                <br />
              </>
            )}

            <span className="mr-5">{">>"}</span>
            {progress}
          </div>

          {/* Current Tools */}
          {currentTool && (
            <div className="py-10">
              <span className="mr-5">{"--- [Current Tool] ---"}</span>
              {currentTool}
            </div>
          )}

          {/* Render Events */}
          <div className="space-y-5">
            {events.map((event, index) => (
                <div>
                    <span></span>
                    {/* {renderEventMessage(event)} */}
                </div>
            ))}
          </div>

          {runStarted && (
            <div>
              <span className="mr-5 animate-in ">
                {"--- [AI StoryTeller Has Started] ---"}
              </span>
              <br />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default StoryWriter;
