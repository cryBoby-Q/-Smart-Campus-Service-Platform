const io = require("socket.io-client");
const socket = io("http://localhost:3001", { reconnectionDelayMax: 1000 });
socket.on("connect", ()=> console.log("socket connected", socket.id));
socket.on("new_item", (data) => { console.log("EVENT new_item", JSON.stringify(data)); });
socket.on("update_item", (data) => { console.log("EVENT update_item", JSON.stringify(data)); });

(async () => {
  try {
    await new Promise((resolve, reject) => {
      if (socket.connected) return resolve();
      socket.once("connect", resolve);
      setTimeout(()=>reject(new Error("socket connect timeout")), 5000);
    });
    const publishRes = await fetch("http://localhost:3001/api/lost/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type:2, goods_type:"测试", title:"socket-test", description:"由test_socket创建", location:"loc", contact:"000" })
    });
    const pub = await publishRes.json();
    console.log("PUBLISH RESP", JSON.stringify(pub));
    const id = pub.data && pub.data.id;
    if(!id){ console.log("No id returned"); process.exit(1); }
    await new Promise(r=>setTimeout(r, 1500));
    const claimRes = await fetch("http://localhost:3001/api/lost/claim", {
      method:"POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ info_id: id, claim_contact:"tester", claim_reason:"test" })
    });
    const cl = await claimRes.json();
    console.log("CLAIM RESP", JSON.stringify(cl));
    await new Promise(r=>setTimeout(r, 1500));
    const detailRes = await fetch(`http://localhost:3001/api/lost/detail/${id}`);
    const detail = await detailRes.json();
    console.log("DETAIL", JSON.stringify(detail));
    setTimeout(()=> process.exit(0), 1000);
  } catch (err) {
    console.error("TEST ERROR", err);
    process.exit(2);
  }
})();
