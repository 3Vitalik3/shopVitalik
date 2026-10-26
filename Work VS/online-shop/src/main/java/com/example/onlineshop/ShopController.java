package com.example.onlineshop;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.sql.PreparedStatement;
import java.sql.Statement;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ShopController {
    private final JdbcTemplate db;
    private final ObjectMapper json;
    private final PasswordEncoder passwords;
    private final AuthenticationManager authenticationManager;
    private final SecurityContextRepository contexts = new HttpSessionSecurityContextRepository();

    public ShopController(JdbcTemplate db, ObjectMapper json, PasswordEncoder passwords, AuthenticationConfiguration config) throws Exception {
        this.db = db; this.json = json; this.passwords = passwords; this.authenticationManager = config.getAuthenticationManager();
    }

    @Bean CommandLineRunner seedShop(JdbcTemplate db, ObjectMapper json, PasswordEncoder passwords) {
        return args -> {
            if (db.queryForObject("SELECT COUNT(*) FROM shop_users", Integer.class) == 0) {
                db.update("INSERT INTO shop_users(name,email,password_hash,role,phone,address) VALUES(?,?,?,?,?,?)", "Администратор", "admin@shop.ru", passwords.encode("admin123"), "admin", "", "");
                db.update("INSERT INTO shop_users(name,email,password_hash,role,phone,address) VALUES(?,?,?,?,?,?)", "Покупатель", "user@shop.ru", passwords.encode("user123"), "user", "", "");
            }
            if (db.queryForObject("SELECT COUNT(*) FROM products", Integer.class) == 0) {
                try (InputStream stream = getClass().getResourceAsStream("/seed/products.json")) {
                    if (stream == null) throw new IllegalStateException("Не найден seed/products.json");
                    for (JsonNode node : json.readTree(stream)) db.update("INSERT INTO products(id,payload) VALUES(?,?)", node.get("id").asLong(), node.toString());
                    db.execute("ALTER TABLE products ALTER COLUMN id RESTART WITH 100");
                }
            }
        };
    }

    private ResponseStatusException bad(String message) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, message); }
    private long userId(Authentication auth) {
        return db.query("SELECT id FROM shop_users WHERE email=?", rs -> {
            if (!rs.next()) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
            return rs.getLong(1);
        }, auth.getName());
    }
    private Map<String,Object> user(Authentication auth) {
        return db.queryForObject("SELECT id,name,email,role,phone,address FROM shop_users WHERE email=?", (rs,n) -> {
            Map<String,Object> result = new LinkedHashMap<>();
            for (String key : List.of("id","name","email","role","phone","address")) result.put(key, rs.getObject(key));
            return result;
        }, auth.getName());
    }
    private void logIn(String email, String password, HttpServletRequest request, HttpServletResponse response) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email.toLowerCase(), password));
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        request.getSession(true);
        request.changeSessionId();
        contexts.saveContext(context, request, response);
    }
    @GetMapping("/csrf") public Map<String,String> csrf(CsrfToken token) { return Map.of("token", token.getToken()); }
    @PostMapping("/auth/login") public Map<String,Object> login(@RequestBody JsonNode body, HttpServletRequest request, HttpServletResponse response) {
        try { logIn(text(body,"email"), text(body,"password"), request, response); }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Неверный email или пароль"); }
        return user(SecurityContextHolder.getContext().getAuthentication());
    }
    @PostMapping("/auth/register") public Map<String,Object> register(@RequestBody JsonNode body, HttpServletRequest request, HttpServletResponse response) {
        String name = text(body,"name").trim(), email = text(body,"email").trim().toLowerCase(), password = text(body,"password");
        if (name.isBlank() || !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$") || password.length() < 6) throw bad("Проверьте имя, email и пароль (минимум 6 символов)");
        if (db.queryForObject("SELECT COUNT(*) FROM shop_users WHERE email=?", Integer.class, email) > 0) throw bad("Email уже занят");
        db.update("INSERT INTO shop_users(name,email,password_hash,role) VALUES(?,?,?,?)", name,email,passwords.encode(password),"user");
        logIn(email,password,request,response);
        return user(SecurityContextHolder.getContext().getAuthentication());
    }
    @PostMapping("/auth/logout") public void logout(HttpServletRequest request, HttpServletResponse response, Authentication auth) { new SecurityContextLogoutHandler().logout(request,response,auth); }
    @GetMapping("/auth/me") public Map<String,Object> me(Authentication auth) { return user(auth); }
    @PutMapping("/profile") public Map<String,Object> profile(@RequestBody JsonNode body, Authentication auth, HttpServletRequest request, HttpServletResponse response) {
        String name=text(body,"name").trim(), email=text(body,"email").trim().toLowerCase();
        if (name.isBlank() || !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) throw bad("Проверьте имя и email");
        long id=userId(auth);
        if (db.queryForObject("SELECT COUNT(*) FROM shop_users WHERE email=? AND id<>?", Integer.class,email,id)>0) throw bad("Email уже занят");
        db.update("UPDATE shop_users SET name=?,email=?,phone=?,address=? WHERE id=?",name,email,text(body,"phone"),text(body,"address"),id);
        if (!email.equals(auth.getName())) {
            Authentication updated = new UsernamePasswordAuthenticationToken(email, null, auth.getAuthorities());
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(updated);
            SecurityContextHolder.setContext(context);
            contexts.saveContext(context, request, response);
        }
        return db.queryForObject("SELECT id,name,email,role,phone,address FROM shop_users WHERE id=?", (rs,n)->Map.of("id",rs.getLong(1),"name",rs.getString(2),"email",rs.getString(3),"role",rs.getString(4),"phone",rs.getString(5),"address",rs.getString(6)),id);
    }
    @PutMapping("/profile/password") public void password(@RequestBody JsonNode body, Authentication auth) {
        String current=text(body,"currentPassword"), next=text(body,"newPassword");
        if (next.length()<6) throw bad("Пароль должен содержать минимум 6 символов");
        long id=userId(auth);
        String hash=db.queryForObject("SELECT password_hash FROM shop_users WHERE id=?",String.class,id);
        if (!passwords.matches(current,hash)) throw bad("Неверный текущий пароль");
        db.update("UPDATE shop_users SET password_hash=? WHERE id=?",passwords.encode(next),id);
    }
    private String text(JsonNode node,String key) { return node.path(key).asText(""); }
    private ObjectNode product(long id) {
        return db.query("SELECT payload FROM products WHERE id=?", rs -> {
            if (!rs.next()) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Товар не найден");
            try { ObjectNode value=(ObjectNode)json.readTree(rs.getString(1)); value.put("id",id); return value; }
            catch (Exception e) { throw new IllegalStateException(e); }
        },id);
    }
    @GetMapping("/products") public List<ObjectNode> products() {
        return db.query("SELECT id,payload FROM products ORDER BY id",(rs,n)-> {
            try { ObjectNode value=(ObjectNode)json.readTree(rs.getString(2)); value.put("id",rs.getLong(1)); return value; }
            catch (Exception e) { throw new IllegalStateException(e); }
        });
    }
    @GetMapping("/products/{id}") public ObjectNode productById(@PathVariable long id) { return product(id); }
    private ObjectNode validatedProduct(JsonNode input) {
        String name=text(input,"name").trim(), category=text(input,"category"), image=text(input,"image").trim();
        if (name.isBlank() || !List.of("electronics","clothing","accessories","home").contains(category) || image.isBlank() || text(input,"description").isBlank()) throw bad("Заполните обязательные поля товара");
        BigDecimal price;
        try { price=new BigDecimal(input.path("price").asText()); } catch(Exception e) { throw bad("Неверная цена"); }
        if (price.signum()<0) throw bad("Цена не может быть отрицательной");
        ObjectNode result=json.createObjectNode();
        result.put("name",name); result.put("category",category);
        result.put("categoryName",Map.of("electronics","Электроника","clothing","Одежда","accessories","Аксессуары","home","Для дома").get(category));
        result.put("price",price); if (input.hasNonNull("oldPrice") && !input.path("oldPrice").asText().isBlank()) result.set("oldPrice",input.get("oldPrice")); else result.putNull("oldPrice");
        result.put("image",image); result.set("images",json.valueToTree(List.of(image)));
        result.put("description",text(input,"description"));
        result.set("features",input.path("features").isArray()?input.get("features"):json.createArrayNode());
        result.put("rating",input.path("rating").asDouble(4.5)); result.put("reviews",input.path("reviews").asInt(0));
        for(String flag:List.of("inStock","isNew","isSale")) result.put(flag,input.path(flag).asBoolean(false));
        return result;
    }
    @PostMapping("/products") public ObjectNode createProduct(@RequestBody JsonNode body) {
        ObjectNode value=validatedProduct(body); GeneratedKeyHolder key=new GeneratedKeyHolder();
        db.update(connection->{ PreparedStatement ps=connection.prepareStatement("INSERT INTO products(payload) VALUES(?)",Statement.RETURN_GENERATED_KEYS); ps.setString(1,value.toString()); return ps; },key);
        value.put("id",((Number)Objects.requireNonNull(key.getKeys()).get("ID")).longValue()); return value;
    }
    @PutMapping("/products/{id}") public ObjectNode updateProduct(@PathVariable long id,@RequestBody JsonNode body) {
        product(id); ObjectNode value=validatedProduct(body); value.put("id",id);
        db.update("UPDATE products SET payload=? WHERE id=?",value.toString(),id); return value;
    }
    @DeleteMapping("/products/{id}") public void deleteProduct(@PathVariable long id) {
        if(db.update("DELETE FROM products WHERE id=?",id)==0) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
    }
    @GetMapping("/cart") public List<Map<String,Object>> cart(Authentication auth) {
        return db.query("SELECT product_id,quantity,added_at FROM cart_items WHERE user_id=? ORDER BY added_at",(rs,n)->Map.of("productId",rs.getLong(1),"quantity",rs.getInt(2),"addedAt",rs.getTimestamp(3).toInstant().toString()),userId(auth));
    }
    @PutMapping("/cart/{productId}") public void setCartItem(@PathVariable long productId,@RequestBody JsonNode body,Authentication auth) {
        int quantity=body.path("quantity").asInt(-1);
        if(quantity<0 || quantity>1000) throw bad("Неверное количество");
        long uid=userId(auth); ObjectNode selected=product(productId);
        if(quantity>0 && !selected.path("inStock").asBoolean()) throw bad("Товара нет в наличии");
        if(quantity==0) db.update("DELETE FROM cart_items WHERE user_id=? AND product_id=?",uid,productId);
        else db.update("MERGE INTO cart_items(user_id,product_id,quantity) KEY(user_id,product_id) VALUES(?,?,?)",uid,productId,quantity);
    }
    @DeleteMapping("/cart") public void clearCart(Authentication auth) { db.update("DELETE FROM cart_items WHERE user_id=?",userId(auth)); }
    private ObjectNode order(long id) {
        return db.query("SELECT user_id,payload,status,created_at FROM shop_orders WHERE id=?",rs->{
            if(!rs.next()) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
            try { ObjectNode value=(ObjectNode)json.readTree(rs.getString(2)); value.put("id",id); value.put("userId",rs.getLong(1)); value.put("status",rs.getString(3)); value.put("date",rs.getTimestamp(4).toInstant().toString()); return value; }
            catch(Exception e){throw new IllegalStateException(e);}
        },id);
    }
    @GetMapping("/orders") public List<ObjectNode> orders(Authentication auth) {
        boolean admin=auth.getAuthorities().stream().anyMatch(a->a.getAuthority().equals("ROLE_ADMIN"));
        String sql="SELECT id FROM shop_orders"+(admin?"":" WHERE user_id=?")+" ORDER BY id DESC";
        List<Long> ids=admin?db.queryForList(sql,Long.class):db.queryForList(sql,Long.class,userId(auth));
        return ids.stream().map(this::order).toList();
    }
    @Transactional
    @PostMapping("/orders") public ObjectNode checkout(Authentication auth) {
        long uid=userId(auth); List<Map<String,Object>> items=cart(auth); if(items.isEmpty()) throw bad("Корзина пуста");
        ArrayNode lines=json.createArrayNode(); BigDecimal subtotal=BigDecimal.ZERO;
        for(Map<String,Object> item:items){ ObjectNode p=product((long)item.get("productId")); if(!p.path("inStock").asBoolean()) throw bad("Один из товаров закончился"); int qty=(int)item.get("quantity"); BigDecimal price=p.path("price").decimalValue(); subtotal=subtotal.add(price.multiply(BigDecimal.valueOf(qty))); ObjectNode line=lines.addObject(); line.put("productId",p.path("id").asLong()); line.put("name",p.path("name").asText()); line.put("price",price); line.put("quantity",qty); }
        BigDecimal shipping=subtotal.compareTo(BigDecimal.valueOf(5000))>0?BigDecimal.ZERO:BigDecimal.valueOf(500);
        String address=db.queryForObject("SELECT address FROM shop_users WHERE id=?",String.class,uid);
        ObjectNode value=json.createObjectNode(); value.set("items",lines); value.put("subtotal",subtotal); value.put("shipping",shipping); value.put("total",subtotal.add(shipping)); value.put("address",address==null||address.isBlank()?"Не указан":address);
        GeneratedKeyHolder key=new GeneratedKeyHolder();
        db.update(connection->{PreparedStatement ps=connection.prepareStatement("INSERT INTO shop_orders(user_id,payload,status) VALUES(?,?,'pending')",Statement.RETURN_GENERATED_KEYS);ps.setLong(1,uid);ps.setString(2,value.toString());return ps;},key);
        db.update("DELETE FROM cart_items WHERE user_id=?",uid);
        return order(((Number)Objects.requireNonNull(key.getKeys()).get("ID")).longValue());
    }
    @PutMapping("/admin/orders/{id}/status") public ObjectNode status(@PathVariable long id,@RequestBody JsonNode body){
        String status=text(body,"status"); if(!List.of("pending","processing","shipped","delivered").contains(status)) throw bad("Неверный статус");
        if(db.update("UPDATE shop_orders SET status=? WHERE id=?",status,id)==0) throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        return order(id);
    }
    @GetMapping("/admin/users") public List<Map<String,Object>> users(){
        return db.query("SELECT id,name,email,role,phone,address FROM shop_users ORDER BY id",(rs,n)->Map.of("id",rs.getLong(1),"name",rs.getString(2),"email",rs.getString(3),"role",rs.getString(4),"phone",rs.getString(5),"address",rs.getString(6)));
    }
}
