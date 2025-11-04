package main

import (
    "fmt"
    "net/http"
    "log/slog"
    "html/template"
    "io"
    "strings"
    "strconv"
)

func main() {

    http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./src"))))
    
    http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
        tmpl, err := template.ParseFiles("./src/index.html")
        if err != nil {
            http.Error(w, "failed to load template: "+err.Error(), http.StatusInternalServerError)
            return
        }
    
        data := map[string]interface{}{
            "RAND_NUM": "",
        }
    
        apiURL := "http://backend:5000/network"
    
        req, err := http.NewRequest("GET", apiURL, nil)
        if err != nil {
            data["RAND_NUM"] = "failed to create request: " + err.Error()
            _ = tmpl.Execute(w, data)
            return
        }
    
        req.Header.Set("Origin", "http://frontend:6000/")
    
        client := &http.Client{}
        resp, err := client.Do(req)
        if err != nil {
            data["RAND_NUM"] = "failed to call API: " + err.Error()
            _ = tmpl.Execute(w, data)
            return
        }
        defer resp.Body.Close()
    
        body, err := io.ReadAll(resp.Body)
        if err != nil {
            data["RAND_NUM"] = "failed to read body: " + err.Error()
            _ = tmpl.Execute(w, data)
            return
        }
    
        countStr := strings.TrimSpace(string(body))
        count, err := strconv.Atoi(countStr)
        if err != nil {
            data["RAND_NUM"] = "invalid integer response: " + countStr
            _ = tmpl.Execute(w, data)
            return
        }
    
        data["RAND_NUM"] = count
        _ = tmpl.Execute(w, data)
    })  

    addr := fmt.Sprintf(":%s", "6000")
    slog.Info("server started on", "port", "6000")
    http.ListenAndServe(addr, nil)
}