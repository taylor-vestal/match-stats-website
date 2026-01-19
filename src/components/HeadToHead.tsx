import "@/styles/HeadToHead.css";
import type { Component } from "solid-js";

const CompareStats: Component = () => {
  let aw: string = "clamp(8rem,11vw,12rem)";
  aw = "14vw";
  return (
    <div class="h2h-compare-stats grid gap-4">BIG BOX 67 VS 69 AYYYYYY</div>
  );
};

const HeadToHead: Component = () => {
  return (
    <div class="container">
      <div class="h2h-summary grid gap-4 mt-8 mb-4">
        <div class="h2h-player l">
          <div id="avatar1" class="aspect-square mb-4">
            AVATAR 1
          </div>
          <div id="dropdown1" class="h-8"></div>
        </div>
        <div class="h2h-icons l"></div>
        <div class="h2h-overall"></div>
        <CompareStats />
        <div class="h2h-icons r"></div>
        <div class="h2h-player r">
          <div id="avatar2" class="aspect-square mb-4">
            AVATAR 2
          </div>
          <div id="dropdown2" class="h-8"></div>
        </div>
      </div>
      <div id="match-history" class="h-48 mt-4">
        MATCH HISTORY
      </div>
    </div>
  );
};

export default HeadToHead;
