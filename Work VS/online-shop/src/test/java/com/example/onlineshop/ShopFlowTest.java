package com.example.onlineshop;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties="spring.datasource.url=jdbc:h2:mem:shoptest;DB_CLOSE_DELAY=-1")
class ShopFlowTest {
    @Autowired MockMvc mvc;

    private MockHttpSession login(String email, String password) throws Exception {
        return (MockHttpSession) mvc.perform(post("/api/auth/login").with(csrf()).contentType("application/json")
            .content("{\"email\":\""+email+"\",\"password\":\""+password+"\"}"))
            .andExpect(status().isOk()).andReturn().getRequest().getSession(false);
    }

    @Test void catalogAndRoleProtection() throws Exception {
        mvc.perform(get("/api/products")).andExpect(status().isOk()).andExpect(jsonPath("$",hasSize(12)));
        MockHttpSession buyer=login("user@shop.ru","user123");
        mvc.perform(get("/pages/admin.html").session(buyer)).andExpect(status().isForbidden());
        mvc.perform(post("/api/products").session(buyer).with(csrf()).contentType("application/json").content("{}"))
            .andExpect(status().isForbidden());
        MockHttpSession admin=login("admin@shop.ru","admin123");
        mvc.perform(get("/pages/admin.html").session(admin)).andExpect(status().isOk());
        mvc.perform(post("/api/products").session(admin).with(csrf()).contentType("application/json")
            .content("{\"name\":\"Тест\",\"category\":\"home\",\"price\":100,\"image\":\"https://example.org/a.jpg\",\"description\":\"Описание\",\"inStock\":true}"))
            .andExpect(status().isOk()).andExpect(jsonPath("$.name",is("Тест")));
    }

    @Test void cartSurvivesLogoutAndIsUserSpecific() throws Exception {
        MockHttpSession buyer=login("user@shop.ru","user123");
        mvc.perform(put("/api/cart/1").session(buyer).with(csrf()).contentType("application/json").content("{\"quantity\":2}"))
            .andExpect(status().isOk());
        mvc.perform(post("/api/auth/logout").session(buyer).with(csrf())).andExpect(status().isOk());
        MockHttpSession again=login("user@shop.ru","user123");
        mvc.perform(get("/api/cart").session(again)).andExpect(status().isOk())
            .andExpect(jsonPath("$[0].productId",is(1))).andExpect(jsonPath("$[0].quantity",is(2)));
        MockHttpSession admin=login("admin@shop.ru","admin123");
        mvc.perform(get("/api/cart").session(admin)).andExpect(status().isOk()).andExpect(jsonPath("$",hasSize(0)));
    }
}
