﻿namespace UnoOnline.Models
{
    public class User
    {
        public long Id { get; set; } 
        public string Apodo { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string? rol { get; set; }
    }
}
