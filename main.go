package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type Message struct {
	Name    string `json:"name"`
	Message string `json:"message"`
}

type Hub struct {
	clients  []Client
	messages []Message
}

type Client struct {
	hub *Hub
	ws  *websocket.Conn
}

func (c *Client) handleRequest() {
	defer c.ws.Close()

	for {
		var message Message
		if err := c.ws.ReadJSON(&message); err != nil {
			log.Println(err)
			continue
		}

		if len(message.Name) == 0 || len(message.Message) == 0 {
			continue
		}

		c.hub.messages = append(c.hub.messages, message)

		c.hub.broadcastMessage()

		time.Sleep(1 * time.Second)
	}
}

func (c *Client) handleBroadcast() {
	if err := c.ws.WriteJSON(c.hub.messages); err != nil {
		log.Println(err)
	}
}

func (h *Hub) broadcastMessage() {
	for _, c := range h.clients {
		c.handleBroadcast()
	}
}

func main() {
	r := gin.Default()
	upgrader := websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	hub := Hub{
		clients:  []Client{},
		messages: []Message{},
	}

	r.GET("/message", func(c *gin.Context) {
		ws, err := upgrader.Upgrade(c.Writer, c.Request, nil)

		if err != nil {
			log.Println("error get connection")
			log.Fatal(err)
			return
		}

		client := Client{
			ws:  ws,
			hub: &hub,
		}

		go client.handleRequest()

		hub.clients = append(hub.clients, client)
	})

	r.GET("/", func(c *gin.Context) {
		c.File("index.html")
	})

	log.Fatal(r.Run(":8080"))
}
